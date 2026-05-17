import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as sodium from 'libsodium-wrappers';
import { GitHubOAuthService } from './github-oauth.service';
import { GitHubTokenResolverService } from './github-token-resolver.service';

export interface CommitResult {
  workflowUrl: string;
  sha: string;
}

export interface WorkflowRunStatus {
  runId: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  url: string;
  /**
   * Full commit SHA (40 chars) that the workflow ran on. Populated from
   * GitHub's `run.head_sha`. Consumers that need to derive a deterministic
   * imageRef (e.g. the build watcher) should use `headSha.slice(0, 7)`.
   */
  headSha: string;
  runStartedAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Commits GitHub Actions workflow files to a user's repository
 * and polls workflow run status via the GitHub Contents & Actions APIs.
 */
@Injectable()
export class GitHubWorkflowService {
  private readonly logger = new Logger(GitHubWorkflowService.name);

  constructor(
    private readonly githubOAuthService: GitHubOAuthService,
    private readonly tokenResolver: GitHubTokenResolverService,
  ) {}

  /**
   * Atomically commit .github/workflows/flui.yml and optionally Dockerfile in a single commit
   * using the Git Data API. A single commit means a single workflow trigger.
   * Skips Dockerfile if it already contains '#flui-managed'.
   */
  async commitWorkflowFiles(
    userId: string,
    owner: string,
    repo: string,
    branch: string,
    workflowYaml: string,
    dockerfile?: string,
  ): Promise<CommitResult> {
    await this.tokenResolver.assertCapability(userId, ['repo', 'workflow']);

    const octokit = await this.tokenResolver.getOctokit(userId, owner);

    // 1. Get current branch tip
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    // 2. Get base tree SHA from the latest commit
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // 3. Build tree items — always include the workflow file
    const treeItems: Array<{
      path: string;
      mode: '100644';
      type: 'blob';
      content: string;
    }> = [
      {
        path: '.github/workflows/flui.yml',
        mode: '100644',
        type: 'blob',
        content: workflowYaml,
      },
    ];

    // Include Dockerfile only if provided and repo doesn't have a #flui-managed one already
    if (dockerfile) {
      const existingContent = await this.getFileContent(
        octokit,
        owner,
        repo,
        branch,
        'Dockerfile',
      );
      if (!existingContent?.includes('#flui-managed')) {
        treeItems.push({
          path: 'Dockerfile',
          mode: '100644',
          type: 'blob',
          content: `# #flui-managed\n${dockerfile}`,
        });
      }
    }

    // 4. Create new tree on top of the base tree
    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // 5. Create commit pointing to the new tree
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: 'chore: add Flui deployment workflow',
      tree: treeData.sha,
      parents: [latestCommitSha],
    });

    // 6. Advance the branch ref to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    const workflowUrl = `https://github.com/${owner}/${repo}/blob/${branch}/.github/workflows/flui.yml`;
    this.logger.log(
      `Committed ${treeItems.length} file(s) atomically to ${owner}/${repo}@${branch} (${newCommit.sha.slice(0, 7)})`,
    );

    return { workflowUrl, sha: newCommit.sha };
  }

  /**
   * V3: Commits only .github/workflows/flui.yml (no Dockerfile).
   *
   * The commit message must NOT contain `[skip ci]`: in V3 the workflow trigger
   * is `on: push: branches: [main]`, so the very commit that adds the workflow
   * is what kicks off the first run. Adding `[skip ci]` would silently swallow
   * the first build and the application would never get a workflowRunId.
   */
  async commitWorkflowOnly(
    userId: string,
    owner: string,
    repo: string,
    branch: string,
    workflowYaml: string,
  ): Promise<CommitResult> {
    await this.tokenResolver.assertCapability(userId, ['repo', 'workflow']);

    const octokit = await this.tokenResolver.getOctokit(userId, owner);

    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: '.github/workflows/flui.yml',
          mode: '100644',
          type: 'blob',
          content: workflowYaml,
        },
      ],
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: 'chore: add Flui deployment workflow',
      tree: treeData.sha,
      parents: [latestCommitSha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    const workflowUrl = `https://github.com/${owner}/${repo}/blob/${branch}/.github/workflows/flui.yml`;
    this.logger.log(
      `V3 workflow committed to ${owner}/${repo}@${branch} (${newCommit.sha.slice(0, 7)})`,
    );

    return { workflowUrl, sha: newCommit.sha };
  }

  /**
   * Get the latest workflow run for flui.yml on a given branch.
   */
  async getLatestWorkflowRun(
    userId: string,
    owner: string,
    repo: string,
    branch: string,
    headSha?: string,
  ): Promise<WorkflowRunStatus | null> {
    const octokit = await this.tokenResolver.getOctokit(userId, owner);

    try {
      const { data } = await octokit.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        branch,
        per_page: 10,
        ...(headSha ? { head_sha: headSha } : {}),
      });

      const fluiRun = data.workflow_runs.find(
        (run) => run.path?.includes('flui.yml') || run.name === 'Flui Deploy',
      );

      if (!fluiRun) return null;

      return this.mapRunStatus(fluiRun);
    } catch (error) {
      this.logger.warn(`Could not fetch workflow runs: ${error.message}`);
      return null;
    }
  }

  /**
   * Get status of a specific workflow run by run ID.
   */
  async getWorkflowRunStatus(
    userId: string,
    owner: string,
    repo: string,
    runId: string,
  ): Promise<WorkflowRunStatus> {
    const octokit = await this.tokenResolver.getOctokit(userId, owner);

    try {
      const { data } = await octokit.actions.getWorkflowRun({
        owner,
        repo,
        run_id: Number.parseInt(runId, 10),
      });

      return this.mapRunStatus(data);
    } catch (error) {
      throw new BadRequestException(
        `Could not fetch workflow run ${runId}: ${error.message}`,
      );
    }
  }

  async getUserAccessToken(userId: string, owner?: string): Promise<string> {
    if (owner) {
      return this.tokenResolver.getAccessToken(userId, owner);
    }
    return this.githubOAuthService.getAccessToken(userId);
  }

  /**
   * Encrypt and save a GitHub Actions secret in the user's repo.
   * The secret value is encrypted with the repo's public key using libsodium
   * before being sent to the GitHub API.
   */
  async saveRepoSecret(
    userId: string,
    owner: string,
    repo: string,
    secretName: string,
    secretValue: string,
  ): Promise<void> {
    const octokit = await this.tokenResolver.getOctokit(userId, owner);

    const { data: keyData } = await octokit.actions.getRepoPublicKey({
      owner,
      repo,
    });

    await sodium.ready;
    const keyBytes = Buffer.from(keyData.key, 'base64');
    const valueBytes = Buffer.from(secretValue);
    const encryptedBytes = sodium.crypto_box_seal(valueBytes, keyBytes);
    const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

    await octokit.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: keyData.key_id,
    });

    this.logger.log(`Saved secret ${secretName} to ${owner}/${repo}`);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async getFileContent(
    octokit: any,
    owner: string,
    repo: string,
    branch: string,
    filePath: string,
  ): Promise<string | null> {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });
      const encoded = data.content as string;
      return Buffer.from(encoded.replaceAll('n', ''), 'base64').toString(
        'utf-8',
      );
    } catch {
      return null;
    }
  }

  private mapRunStatus(run: any): WorkflowRunStatus {
    const parseDate = (v: unknown): Date | null => {
      if (!v || typeof v !== 'string') return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    return {
      runId: String(run.id),
      status: run.status as 'queued' | 'in_progress' | 'completed',
      conclusion: run.conclusion as 'success' | 'failure' | 'cancelled' | null,
      url: run.html_url,
      headSha: run.head_sha ?? '',
      runStartedAt: parseDate(run.run_started_at) ?? parseDate(run.created_at),
      updatedAt: parseDate(run.updated_at),
    };
  }
}
