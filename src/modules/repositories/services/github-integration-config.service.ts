import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { GitHubIntegrationConfigEntity } from '../entities/github-integration-config.entity';
import { GitHubAuthMethod } from '../enums/github-auth-method.enum';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';

@Injectable()
export class GitHubIntegrationConfigService implements OnModuleInit {
  private readonly logger = new Logger(GitHubIntegrationConfigService.name);

  constructor(
    @InjectRepository(GitHubIntegrationConfigEntity)
    private readonly configRepo: Repository<GitHubIntegrationConfigEntity>,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.migrateFromEnvIfNeeded();
  }

  private async migrateFromEnvIfNeeded(): Promise<void> {
    const existing = await this.configRepo.findOne({ where: {} });
    if (existing) {
      // Row already present: top up missing client credentials from env so
      // adding GITHUB_(APP_)CLIENT_ID/SECRET after first boot takes effect.
      await this.topUpClientCredentialsFromEnv(existing);
      return;
    }

    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackUrl = this.configService.get<string>(
      'GITHUB_OAUTH_CALLBACK_URL',
    );

    if (clientId && clientSecret && callbackUrl) {
      this.logger.log(
        'Migrating GitHub OAuth config from environment variables to database',
      );
      await this.configRepo.save(
        this.configRepo.create({
          authMethod: GitHubAuthMethod.OAUTH_APP,
          clientIdEncrypted: this.encryptionService.encrypt(clientId),
          clientSecretEncrypted: this.encryptionService.encrypt(clientSecret),
          callbackUrl,
          isConfigured: true,
        }),
      );
      return;
    }

    const appId = this.configService.get<string>('GITHUB_APP_ID');
    let privateKey = this.configService.get<string>('GITHUB_APP_PRIVATE_KEY');
    const privateKeyPath = this.configService.get<string>(
      'GITHUB_APP_PRIVATE_KEY_PATH',
    );
    const webhookSecret = this.configService.get<string>(
      'GITHUB_APP_WEBHOOK_SECRET',
    );
    const appSlug = this.configService.get<string>('GITHUB_APP_SLUG');
    // Accept both GITHUB_APP_CLIENT_ID and GITHUB_CLIENT_ID — the two names
    // historically refer to the same GitHub App's OAuth client id/secret.
    const appClientId =
      this.configService.get<string>('GITHUB_APP_CLIENT_ID') ??
      this.configService.get<string>('GITHUB_CLIENT_ID');
    const appClientSecret =
      this.configService.get<string>('GITHUB_APP_CLIENT_SECRET') ??
      this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const appCallbackUrl =
      this.configService.get<string>('GITHUB_APP_CALLBACK_URL') ??
      this.configService.get<string>('GITHUB_OAUTH_CALLBACK_URL');

    if (!privateKey && privateKeyPath) {
      try {
        const resolved = path.isAbsolute(privateKeyPath)
          ? privateKeyPath
          : path.join(process.cwd(), privateKeyPath);
        privateKey = await fs.readFile(resolved, 'utf-8');
        this.logger.log(`Read GitHub App private key from ${resolved}`);
      } catch (err) {
        this.logger.warn(
          `Could not read GITHUB_APP_PRIVATE_KEY_PATH (${privateKeyPath}): ${err.message}`,
        );
      }
    }

    if (appId && privateKey) {
      this.logger.log(
        'Migrating GitHub App config from environment variables to database',
      );
      await this.configRepo.save(
        this.configRepo.create({
          authMethod: GitHubAuthMethod.GITHUB_APP,
          appId,
          privateKeyEncrypted: this.encryptionService.encrypt(privateKey),
          appWebhookSecretEncrypted: webhookSecret
            ? this.encryptionService.encrypt(webhookSecret)
            : null,
          appSlug: appSlug ?? 'flui-cloud',
          clientIdEncrypted: appClientId
            ? this.encryptionService.encrypt(appClientId)
            : null,
          clientSecretEncrypted: appClientSecret
            ? this.encryptionService.encrypt(appClientSecret)
            : null,
          callbackUrl: appCallbackUrl ?? null,
          isConfigured: true,
        }),
      );
    }
  }

  private async topUpClientCredentialsFromEnv(
    existing: GitHubIntegrationConfigEntity,
  ): Promise<void> {
    const envClientId =
      this.configService.get<string>('GITHUB_APP_CLIENT_ID') ??
      this.configService.get<string>('GITHUB_CLIENT_ID');
    const envClientSecret =
      this.configService.get<string>('GITHUB_APP_CLIENT_SECRET') ??
      this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const envCallbackUrl =
      this.configService.get<string>('GITHUB_APP_CALLBACK_URL') ??
      this.configService.get<string>('GITHUB_OAUTH_CALLBACK_URL');

    let dirty = false;
    if (envClientId && !existing.clientIdEncrypted) {
      existing.clientIdEncrypted = this.encryptionService.encrypt(envClientId);
      dirty = true;
    }
    if (envClientSecret && !existing.clientSecretEncrypted) {
      existing.clientSecretEncrypted =
        this.encryptionService.encrypt(envClientSecret);
      dirty = true;
    }
    if (envCallbackUrl && !existing.callbackUrl) {
      existing.callbackUrl = envCallbackUrl;
      dirty = true;
    }
    if (dirty) {
      await this.configRepo.save(existing);
      this.logger.log(
        'Backfilled GitHub App client_id/client_secret/callback_url from environment',
      );
    }
  }

  async getConfig(): Promise<GitHubIntegrationConfigEntity | null> {
    return this.configRepo.findOne({ where: { isConfigured: true } });
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return config !== null;
  }

  async getClientId(): Promise<string | null> {
    const config = await this.getConfig();
    if (!config?.clientIdEncrypted) return null;
    return this.encryptionService.decrypt(config.clientIdEncrypted);
  }

  async getClientSecret(): Promise<string | null> {
    const config = await this.getConfig();
    if (!config?.clientSecretEncrypted) return null;
    return this.encryptionService.decrypt(config.clientSecretEncrypted);
  }

  async getCallbackUrl(): Promise<string | null> {
    const config = await this.getConfig();
    return config?.callbackUrl ?? null;
  }

  async getSetupStatus(): Promise<{
    configured: boolean;
    authMethod: GitHubAuthMethod | null;
    appSlug?: string;
  }> {
    const config = await this.getConfig();
    if (!config) {
      return { configured: false, authMethod: null };
    }
    return {
      configured: true,
      authMethod: config.authMethod,
      ...(config.authMethod === GitHubAuthMethod.GITHUB_APP && config.appSlug
        ? { appSlug: config.appSlug }
        : {}),
    };
  }

  async configureOAuth(
    clientId: string,
    clientSecret: string,
    callbackUrl: string,
  ): Promise<void> {
    await this.validateOAuthCredentials(clientId, clientSecret);

    const existing = await this.configRepo.findOne({ where: {} });

    const data = {
      authMethod: GitHubAuthMethod.OAUTH_APP,
      clientIdEncrypted: this.encryptionService.encrypt(clientId),
      clientSecretEncrypted: this.encryptionService.encrypt(clientSecret),
      callbackUrl,
      isConfigured: true,
    };

    if (existing) {
      await this.configRepo.save({ ...existing, ...data });
    } else {
      await this.configRepo.save(this.configRepo.create(data));
    }

    this.logger.log('GitHub OAuth App configuration saved');
  }

  async configurePatMode(): Promise<void> {
    const existing = await this.configRepo.findOne({ where: {} });

    const data = {
      authMethod: GitHubAuthMethod.PAT,
      clientIdEncrypted: null,
      clientSecretEncrypted: null,
      callbackUrl: null,
      isConfigured: true,
    };

    if (existing) {
      await this.configRepo.save({ ...existing, ...data });
    } else {
      await this.configRepo.save(this.configRepo.create(data));
    }

    this.logger.log('GitHub PAT mode configured');
  }

  async configureGitHubApp(dto: {
    appId: string;
    privateKey: string;
    webhookSecret: string;
    appSlug: string;
    clientId?: string;
    clientSecret?: string;
    callbackUrl?: string;
  }): Promise<void> {
    await this.validateGitHubAppCredentials(dto.appId, dto.privateKey);

    const existing = await this.configRepo.findOne({ where: {} });

    const data = {
      authMethod: GitHubAuthMethod.GITHUB_APP,
      appId: dto.appId,
      privateKeyEncrypted: this.encryptionService.encrypt(dto.privateKey),
      appWebhookSecretEncrypted: this.encryptionService.encrypt(
        dto.webhookSecret,
      ),
      appSlug: dto.appSlug,
      clientIdEncrypted: dto.clientId
        ? this.encryptionService.encrypt(dto.clientId)
        : (existing?.clientIdEncrypted ?? null),
      clientSecretEncrypted: dto.clientSecret
        ? this.encryptionService.encrypt(dto.clientSecret)
        : (existing?.clientSecretEncrypted ?? null),
      callbackUrl: dto.callbackUrl ?? existing?.callbackUrl ?? null,
      isConfigured: true,
    };

    if (existing) {
      await this.configRepo.save({ ...existing, ...data });
    } else {
      await this.configRepo.save(this.configRepo.create(data));
    }

    this.logger.log('GitHub App configuration saved');
  }

  async getAppId(): Promise<string | null> {
    const config = await this.getConfig();
    return config?.appId ?? null;
  }

  async getPrivateKey(): Promise<string | null> {
    const config = await this.getConfig();
    if (!config?.privateKeyEncrypted) return null;
    return this.encryptionService.decrypt(config.privateKeyEncrypted);
  }

  async getAppWebhookSecret(): Promise<string | null> {
    const config = await this.getConfig();
    if (!config?.appWebhookSecretEncrypted) return null;
    return this.encryptionService.decrypt(config.appWebhookSecretEncrypted);
  }

  async getAppSlug(): Promise<string | null> {
    const config = await this.getConfig();
    return config?.appSlug ?? null;
  }

  async resetConfig(): Promise<void> {
    await this.configRepo.delete({});
    this.logger.log('GitHub integration config reset');
  }

  private async validateGitHubAppCredentials(
    appId: string,
    privateKey: string,
  ): Promise<void> {
    try {
      const auth = createAppAuth({ appId, privateKey });
      const { token } = await auth({ type: 'app' });
      const octokit = new Octokit({ auth: token });
      await octokit.apps.getAuthenticated();
    } catch (error) {
      this.logger.error(
        `GitHub App credential validation failed: ${error.message}`,
      );
      throw new BadRequestException(
        'Invalid GitHub App credentials. Verify the App ID and Private Key are correct.',
      );
    }
  }

  private async validateOAuthCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<void> {
    try {
      const octokit = new Octokit({
        auth: {
          clientId,
          clientSecret,
        },
      });
      await octokit.apps.checkToken({
        client_id: clientId,
        access_token: 'dummy',
      });
    } catch (error) {
      if (
        error.status === 422 ||
        error.message?.includes('Unprocessable Entity')
      ) {
        return;
      }
      if (error.status === 404) {
        throw new BadRequestException(
          'Invalid GitHub OAuth App credentials. Check your Client ID and Client Secret.',
        );
      }
      this.logger.warn(
        `OAuth credential validation returned: ${error.status} ${error.message}`,
      );
    }
  }
}
