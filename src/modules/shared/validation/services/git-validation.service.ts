import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';

export interface ParsedGitUrl {
  provider: 'github' | 'gitlab' | 'bitbucket' | 'unknown';
  owner: string;
  repo: string;
  fullName: string;
}

@Injectable()
export class GitValidationService {
  private readonly logger = new Logger(GitValidationService.name);

  validateGitUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const gitUrlPatterns = [
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/,
      /^https:\/\/gitlab\.com\/[\w-]+\/[\w.-]+$/,
      /^https:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+$/,
      /^git@github\.com:[\w-]+\/[\w.-]+\.git$/,
      /^git@gitlab\.com:[\w-]+\/[\w.-]+\.git$/,
      /^git@bitbucket\.org:[\w-]+\/[\w.-]+\.git$/,
    ];

    return gitUrlPatterns.some((pattern) => pattern.test(url));
  }

  parseGitUrl(url: string): ParsedGitUrl | null {
    if (!this.validateGitUrl(url)) {
      this.logger.warn(`Invalid Git URL: ${url}`);
      return null;
    }

    try {
      let provider: ParsedGitUrl['provider'] = 'unknown';
      let owner = '';
      let repo = '';

      if (url.includes('github.com')) {
        provider = 'github';
      } else if (url.includes('gitlab.com')) {
        provider = 'gitlab';
      } else if (url.includes('bitbucket.org')) {
        provider = 'bitbucket';
      }

      if (url.startsWith('https://')) {
        const match = /https:\/\/[^/]+\/([^/]+)\/([^/]+)/.exec(url);
        if (match) {
          owner = match[1];
          repo = match[2].replace(/\.git$/, '');
        }
      } else if (url.startsWith('git@')) {
        const match = /git@[^:]+:([^/]+)\/([^/]+)\.git$/.exec(url);
        if (match) {
          owner = match[1];
          repo = match[2];
        }
      }

      return {
        provider,
        owner,
        repo,
        fullName: `${owner}/${repo}`,
      };
    } catch (error) {
      this.logger.error(`Failed to parse Git URL: ${url}`, error.stack);
      return null;
    }
  }

  validateGitHubWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      if (!signature?.startsWith('sha256=')) {
        return false;
      }

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload, 'utf8');
      const expectedSignature = `sha256=${hmac.digest('hex')}`;

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      this.logger.error(
        'GitHub webhook signature validation failed',
        error.stack,
      );
      return false;
    }
  }

  validateGitLabWebhookToken(
    receivedToken: string,
    expectedToken: string,
  ): boolean {
    try {
      if (!receivedToken || !expectedToken) {
        return false;
      }

      return crypto.timingSafeEqual(
        Buffer.from(receivedToken),
        Buffer.from(expectedToken),
      );
    } catch (error) {
      this.logger.error('GitLab webhook token validation failed', error.stack);
      return false;
    }
  }

  normalizeBranchName(branch: string): string {
    return branch.replace(/^refs\/heads\//, '');
  }

  extractRepositoryNameFromUrl(url: string): string {
    const parsed = this.parseGitUrl(url);
    return parsed ? parsed.repo : '';
  }

  isValidBranchName(branch: string): boolean {
    const invalidPatterns = [
      /\.\./,
      /^-/,
      /-$/,
      /\/$/,
      /^\//,
      /@{/,
      /[\x00-\x1f\x7f]/,
      /\s/,
    ];

    return !invalidPatterns.some((pattern) => pattern.test(branch));
  }

  isValidCommitSha(sha: string): boolean {
    return /^[0-9a-f]{7,40}$/i.test(sha);
  }
}
