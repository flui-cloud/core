import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { RepositoryCredentialsRepository } from '../repositories/repository-credentials.repository';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { GitProvider } from '../entities/repository.entity';
import { GitHubAuthMethod } from '../enums/github-auth-method.enum';
import { GitHubIntegrationConfigService } from './github-integration-config.service';
import { GitHubAppService } from './github-app.service';
import {
  GitHubOAuthInitiateResponseDto,
  GitHubOAuthStatusResponseDto,
  ConnectPatResponseDto,
  PublicRepoSearchResultDto,
  PublicRepoBranchDto,
} from '../dto/github-oauth.dto';

interface OAuthStateData {
  userId: string;
  timestamp: number;
}

@Injectable()
export class GitHubOAuthService {
  private readonly logger = new Logger(GitHubOAuthService.name);
  private readonly oauthScopes = [
    'repo',
    'user:email',
    'admin:repo_hook',
    'write:packages',
    // Required for `flui deploy --no-build` GHCR latest-tag auto-discovery.
    // Note: GitHub claims `write:packages` includes read access, but in practice
    // listing package versions returns 404 without this explicit scope.
    'read:packages',
    'workflow',
  ];
  private readonly stateCache = new Map<string, OAuthStateData>();
  private readonly STATE_EXPIRY_MS = 5 * 60 * 1000;

  constructor(
    private readonly integrationConfig: GitHubIntegrationConfigService,
    private readonly githubAppService: GitHubAppService,
    private readonly credentialsRepository: RepositoryCredentialsRepository,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {
    this.startStateCacheCleaner();
  }

  private startStateCacheCleaner(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [state, data] of this.stateCache.entries()) {
        if (now - data.timestamp > this.STATE_EXPIRY_MS) {
          this.stateCache.delete(state);
        }
      }
    }, 60 * 1000);
  }

  async initiateOAuth(userId: string): Promise<GitHubOAuthInitiateResponseDto> {
    const config = await this.integrationConfig.getConfig();

    if (!config?.isConfigured) {
      throw new ServiceUnavailableException(
        'GitHub integration not configured. Complete setup first via POST /repositories/github/setup/oauth',
      );
    }

    if (config.authMethod !== GitHubAuthMethod.OAUTH_APP) {
      throw new BadRequestException(
        'GitHub is configured in PAT mode. Use POST /repositories/github/connect-pat instead.',
      );
    }

    const clientId = this.encryptionService.decrypt(config.clientIdEncrypted);
    const callbackUrl = config.callbackUrl;

    const state = this.encryptionService.generateRandomToken(32);
    this.stateCache.set(state, { userId, timestamp: Date.now() });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: this.oauthScopes.join(' '),
      state,
      allow_signup: 'true',
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    this.logger.log(`Initiated OAuth flow for user ${userId}`);

    return { url, state };
  }

  async handleCallback(
    code: string,
    state: string,
  ): Promise<{ userId: string; credentialId: string }> {
    const stateData = this.stateCache.get(state);

    if (!stateData) {
      throw new BadRequestException(
        'Invalid or expired state token. Please try connecting again.',
      );
    }

    const now = Date.now();
    if (now - stateData.timestamp > this.STATE_EXPIRY_MS) {
      this.stateCache.delete(state);
      throw new BadRequestException(
        'State token expired. Please try connecting again.',
      );
    }

    this.stateCache.delete(state);

    const clientId = await this.integrationConfig.getClientId();
    const clientSecret = await this.integrationConfig.getClientSecret();
    const callbackUrl = await this.integrationConfig.getCallbackUrl();

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'GitHub OAuth App credentials not available.',
      );
    }

    try {
      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: callbackUrl,
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        this.logger.error(
          `GitHub OAuth error: ${tokenData.error} - ${tokenData.error_description}`,
        );
        throw new BadRequestException(
          `GitHub OAuth failed: ${tokenData.error_description || tokenData.error}`,
        );
      }

      const { access_token, scope, token_type } = tokenData;

      const octokit = new Octokit({ auth: access_token });
      const userInfo = await octokit.users.getAuthenticated();

      await this.credentialsRepository.revokeAllByProvider(
        stateData.userId,
        GitProvider.GITHUB,
      );

      const credential = await this.credentialsRepository.create({
        userId: stateData.userId,
        provider: GitProvider.GITHUB,
        credentialType: GitHubAuthMethod.OAUTH_APP,
        accessTokenEncrypted: this.encryptionService.encrypt(access_token),
        scope: scope || this.oauthScopes.join(' '),
        tokenType: token_type || 'Bearer',
        githubUserId: userInfo.data.id.toString(),
        githubUsername: userInfo.data.login,
        isActive: true,
      });

      this.logger.log(
        `GitHub OAuth completed for user ${stateData.userId} (GitHub: ${userInfo.data.login})`,
      );

      return { userId: stateData.userId, credentialId: credential.id };
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Failed to complete GitHub authorization: ${error.message}`,
      );
    }
  }

  async connectWithPat(
    userId: string,
    pat: string,
  ): Promise<ConnectPatResponseDto> {
    const config = await this.integrationConfig.getConfig();

    if (!config?.isConfigured) {
      throw new ServiceUnavailableException(
        'GitHub integration not configured. Complete setup first via POST /repositories/github/setup/pat',
      );
    }

    if (config.authMethod !== GitHubAuthMethod.PAT) {
      throw new BadRequestException(
        'GitHub is configured in OAuth App mode. Use GET /repositories/github/connect instead.',
      );
    }

    let githubUserId: string;
    let githubUsername: string;

    try {
      const octokit = new Octokit({ auth: pat });
      const { data } = await octokit.users.getAuthenticated();
      githubUserId = data.id.toString();
      githubUsername = data.login;
    } catch {
      throw new BadRequestException(
        'Invalid Personal Access Token. Make sure it has the required scopes: repo, user:email',
      );
    }

    await this.credentialsRepository.revokeAllByProvider(
      userId,
      GitProvider.GITHUB,
    );

    await this.credentialsRepository.create({
      userId,
      provider: GitProvider.GITHUB,
      credentialType: GitHubAuthMethod.PAT,
      accessTokenEncrypted: this.encryptionService.encrypt(pat),
      scope: this.oauthScopes.join(' '),
      tokenType: 'Bearer',
      githubUserId,
      githubUsername,
      isActive: true,
    });

    this.logger.log(
      `GitHub PAT connected for user ${userId} (GitHub: ${githubUsername})`,
    );

    return { connected: true, githubUsername };
  }

  async getActiveCredential(userId: string) {
    const credential = await this.credentialsRepository.findByUserIdAndProvider(
      userId,
      GitProvider.GITHUB,
    );

    if (!credential) {
      throw new NotFoundException(
        'No active GitHub connection found. Please connect your GitHub account.',
      );
    }

    return credential;
  }

  async getStatus(userId: string): Promise<GitHubOAuthStatusResponseDto> {
    // In GitHub App mode, check for any active installation.
    // The installation webhook doesn't carry the Flui userId (it comes from
    // GitHub, not the dashboard), so we check all installations globally.
    if (await this.githubAppService.isEnabled()) {
      const installations = await this.githubAppService.listInstallations();
      if (installations.length > 0) {
        return {
          connected: true,
          githubUsername: installations[0].accountLogin,
          connectedAt: installations[0].createdAt,
        };
      }
      return { connected: false };
    }

    const credential = await this.credentialsRepository.findByUserIdAndProvider(
      userId,
      GitProvider.GITHUB,
    );

    if (!credential) {
      return { connected: false };
    }

    return {
      connected: true,
      githubUsername: credential.githubUsername,
      scopes: credential.scope,
      connectedAt: credential.createdAt,
    };
  }

  async revokeAccess(userId: string): Promise<void> {
    const credential = await this.getActiveCredential(userId);
    const accessToken = this.encryptionService.decrypt(
      credential.accessTokenEncrypted,
    );

    if (credential.credentialType === GitHubAuthMethod.OAUTH_APP) {
      try {
        const clientId = await this.integrationConfig.getClientId();
        const clientSecret = await this.integrationConfig.getClientSecret();

        if (clientId && clientSecret) {
          const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
            'base64',
          );
          await fetch(`https://api.github.com/applications/${clientId}/grant`, {
            method: 'DELETE',
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Basic ${basicAuth}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({ access_token: accessToken }),
          });
          this.logger.log(`Revoked GitHub OAuth grant for user ${userId}`);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to revoke GitHub OAuth grant: ${error.message}`,
        );
      }
    }

    await this.credentialsRepository.revoke(credential.id);
    this.logger.log(`Deactivated GitHub credential for user ${userId}`);
  }

  async getOctokit(userId: string): Promise<Octokit> {
    const credential = await this.getActiveCredential(userId);
    const accessToken = this.encryptionService.decrypt(
      credential.accessTokenEncrypted,
    );
    return new Octokit({ auth: accessToken });
  }

  async getAccessToken(userId: string): Promise<string> {
    const credential = await this.getActiveCredential(userId);
    return this.encryptionService.decrypt(credential.accessTokenEncrypted);
  }

  /**
   * Returns the OAuth scopes associated with the user's current GitHub token.
   * GitHub includes them in the `x-oauth-scopes` response header on every API call.
   */
  async getTokenScopes(userId: string): Promise<string[]> {
    const octokit = await this.getOctokit(userId);
    const response = await octokit.users.getAuthenticated();
    const scopeHeader =
      (response.headers as Record<string, string>)['x-oauth-scopes'] ?? '';
    return scopeHeader
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * Throws a `BadRequestException` with a re-authorization message if any of
   * the required GitHub OAuth scopes are missing from the user's current token.
   */
  async assertRequiredScopes(
    userId: string,
    required: string[],
  ): Promise<void> {
    const current = await this.getTokenScopes(userId);
    const missing = required.filter((s) => !current.includes(s));

    if (missing.length > 0) {
      throw new BadRequestException(
        `Your GitHub connection is missing the required permission${missing.length > 1 ? 's' : ''}: ` +
          `[${missing.join(', ')}]. ` +
          `Please re-authorize your GitHub account via GET /repositories/github/connect to grant the new scopes.`,
      );
    }
  }

  async testConnection(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const octokit = await this.getOctokit(userId);
      await octokit.users.getAuthenticated();
      return { success: true, message: 'GitHub connection is active' };
    } catch (error) {
      this.logger.error(
        `GitHub connection test failed for user ${userId}`,
        error.stack,
      );
      return { success: false, message: 'GitHub connection test failed' };
    }
  }

  /**
   * Search public GitHub repositories. Uses GITHUB_TOKEN env var if set (5000 req/hr),
   * otherwise falls back to unauthenticated requests (60 req/hr).
   */
  async searchPublicRepositories(
    query: string,
    limit: number,
  ): Promise<PublicRepoSearchResultDto[]> {
    const systemToken = this.configService.get<string>('GITHUB_TOKEN');
    const octokit = new Octokit({ auth: systemToken || undefined });

    const { data } = await octokit.search.repos({
      q: query,
      per_page: Math.min(limit, 100),
      sort: 'stars',
      order: 'desc',
    });

    return data.items.map((item) => ({
      name: item.name,
      full_name: item.full_name,
      description: item.description ?? null,
      stars: item.stargazers_count,
      language: item.language ?? null,
      default_branch: item.default_branch,
      clone_url: item.clone_url,
      html_url: item.html_url,
      is_private: false as const,
    }));
  }

  /**
   * List branches of a public GitHub repository.
   * Uses GITHUB_TOKEN env var if set for higher rate limits.
   * @param ownerRepo  owner/repo format (e.g. "vercel/next.js")
   */
  async getPublicRepoBranches(
    ownerRepo: string,
  ): Promise<PublicRepoBranchDto[]> {
    const parts = ownerRepo.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new BadRequestException(
        'repo must be in owner/repo format (e.g. "vercel/next.js")',
      );
    }
    const [owner, repo] = parts;

    const systemToken = this.configService.get<string>('GITHUB_TOKEN');
    const octokit = new Octokit({ auth: systemToken || undefined });

    const { data } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    return data.map((branch) => ({
      name: branch.name,
      sha: branch.commit.sha,
    }));
  }
}
