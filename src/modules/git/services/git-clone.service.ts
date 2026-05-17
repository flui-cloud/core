import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { simpleGit, SimpleGit } from 'simple-git';
import { FileSystemService } from '../../shared/utilities/services/file-system.service';

export interface CloneOptions {
  depth?: number;
  branch?: string;
  singleBranch?: boolean;
}

export interface CloneResult {
  localPath: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class GitCloneService implements OnModuleInit {
  private readonly logger = new Logger(GitCloneService.name);
  private readonly workspaceRoot: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly fileSystemService: FileSystemService,
  ) {
    const defaultWorkspace = path.join(os.tmpdir(), 'flui-git-workspace');
    this.workspaceRoot = this.configService.get<string>(
      'GIT_WORKSPACE_ROOT',
      defaultWorkspace,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.initializeWorkspace();
  }

  private async initializeWorkspace(): Promise<void> {
    try {
      if (!(await this.fileSystemService.fileExistsAsync(this.workspaceRoot))) {
        await this.fileSystemService.createDirectory(this.workspaceRoot);
        this.logger.log(`Created workspace root: ${this.workspaceRoot}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize workspace root: ${this.workspaceRoot}`,
        error.stack,
      );
    }
  }

  async cloneRepository(
    repositoryUrl: string,
    accessToken: string,
    options: CloneOptions = {},
  ): Promise<CloneResult> {
    const cloneId = this.generateCloneId();
    const localPath = path.join(this.workspaceRoot, cloneId);

    try {
      this.logger.log(`Cloning repository: ${repositoryUrl} to ${localPath}`);

      // DO NOT create the directory - git clone will create it
      // Creating it beforehand causes "destination path already exists" error

      const authenticatedUrl = this.injectToken(repositoryUrl, accessToken);

      const git: SimpleGit = simpleGit();

      const cloneOptions: string[] = [];
      if (options.depth) {
        cloneOptions.push(`--depth=${options.depth}`);
      }
      if (options.branch) {
        cloneOptions.push(`--branch=${options.branch}`);
      }
      if (options.singleBranch) {
        cloneOptions.push('--single-branch');
      }

      await git.clone(authenticatedUrl, localPath, cloneOptions);

      this.logger.log(`Successfully cloned repository to ${localPath}`);

      return {
        localPath,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to clone repository: ${repositoryUrl}`,
        error.stack,
      );

      // Cleanup any partial clone attempts
      await this.cleanup(localPath);

      return {
        localPath,
        success: false,
        error: error.message,
      };
    }
  }

  async checkoutBranch(localPath: string, branch: string): Promise<void> {
    try {
      const git: SimpleGit = simpleGit(localPath);
      await git.checkout(branch);
      this.logger.log(`Checked out branch: ${branch} in ${localPath}`);
    } catch (error) {
      this.logger.error(`Failed to checkout branch: ${branch}`, error.stack);
      throw new Error(`Failed to checkout branch: ${branch}`);
    }
  }

  async checkoutCommit(localPath: string, commitSha: string): Promise<void> {
    try {
      const git: SimpleGit = simpleGit(localPath);
      await git.checkout(commitSha);
      this.logger.log(`Checked out commit: ${commitSha} in ${localPath}`);
    } catch (error) {
      this.logger.error(`Failed to checkout commit: ${commitSha}`, error.stack);
      throw new Error(`Failed to checkout commit: ${commitSha}`);
    }
  }

  async pull(localPath: string): Promise<void> {
    try {
      const git: SimpleGit = simpleGit(localPath);
      await git.pull();
      this.logger.log(`Pulled latest changes in ${localPath}`);
    } catch (error) {
      this.logger.error(`Failed to pull repository: ${localPath}`, error.stack);
      throw new Error(`Failed to pull repository`);
    }
  }

  async getLatestCommitSha(localPath: string): Promise<string> {
    try {
      const git: SimpleGit = simpleGit(localPath);
      const log = await git.log(['-1']);
      return log.latest.hash;
    } catch (error) {
      this.logger.error(
        `Failed to get latest commit SHA: ${localPath}`,
        error.stack,
      );
      throw new Error(`Failed to get latest commit SHA`);
    }
  }

  async getCurrentBranch(localPath: string): Promise<string> {
    try {
      const git: SimpleGit = simpleGit(localPath);
      const status = await git.status();
      return status.current;
    } catch (error) {
      this.logger.error(
        `Failed to get current branch: ${localPath}`,
        error.stack,
      );
      throw new Error(`Failed to get current branch`);
    }
  }

  async cleanup(localPath: string): Promise<void> {
    const maxRetries = 3;
    const retryDelayMs = 500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (await this.fileSystemService.fileExistsAsync(localPath)) {
          await this.fileSystemService.deleteDirectory(localPath);
          this.logger.log(`Cleaned up repository: ${localPath}`);
          return;
        } else {
          // Directory doesn't exist, nothing to clean
          return;
        }
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(
            `Failed to cleanup repository after ${maxRetries} attempts: ${localPath}`,
            error.stack,
          );
        } else {
          this.logger.warn(
            `Cleanup attempt ${attempt}/${maxRetries} failed for ${localPath}, retrying in ${retryDelayMs}ms...`,
          );
          // Wait before retrying (helps with locked files on Windows)
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelayMs * attempt),
          );
        }
      }
    }
  }

  async cleanupAll(): Promise<void> {
    try {
      if (await this.fileSystemService.fileExistsAsync(this.workspaceRoot)) {
        await this.fileSystemService.deleteDirectory(this.workspaceRoot);
        this.logger.log(`Cleaned up all repositories in workspace`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup workspace`, error.stack);
    }
  }

  private injectToken(url: string, token: string): string {
    if (!token) return url;
    if (url.startsWith('https://github.com/')) {
      return url.replace(
        'https://github.com/',
        `https://x-access-token:${token}@github.com/`,
      );
    } else if (url.startsWith('https://gitlab.com/')) {
      return url.replace(
        'https://gitlab.com/',
        `https://oauth2:${token}@gitlab.com/`,
      );
    } else if (url.startsWith('https://bitbucket.org/')) {
      return url.replace(
        'https://bitbucket.org/',
        `https://x-token-auth:${token}@bitbucket.org/`,
      );
    }
    return url;
  }

  private generateCloneId(): string {
    // Use UUID to guarantee uniqueness and avoid race conditions
    // Format: clone-{uuid} (e.g., clone-a1b2c3d4-e5f6-7890-abcd-ef1234567890)
    return `clone-${crypto.randomUUID()}`;
  }

  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
}
