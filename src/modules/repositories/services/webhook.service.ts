import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RepositoriesRepository } from '../repositories/repositories.repository';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { GitValidationService } from '../../shared/validation/services/git-validation.service';
import { GitHubProviderService } from '../../git/services/github-provider.service';
import { GitProvider } from '../entities/repository.entity';
import { CreateWebhookDto } from '../dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly repositoriesRepository: RepositoriesRepository,
    private readonly encryptionService: EncryptionService,
    private readonly gitValidationService: GitValidationService,
    private readonly githubProviderService: GitHubProviderService,
  ) {
    this.webhookBaseUrl = this.configService.get<string>(
      'WEBHOOK_BASE_URL',
      'http://localhost:3000',
    );

    this.validateWebhookBaseUrl();
  }

  private validateWebhookBaseUrl(): void {
    const isLocalhost =
      this.webhookBaseUrl.includes('localhost') ||
      this.webhookBaseUrl.includes('127.0.0.1');

    if (isLocalhost) {
      this.logger.warn(
        '\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '⚠️  WEBHOOK_BASE_URL is set to localhost!\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '\n' +
          '   GitHub webhooks will NOT work with localhost URLs.\n' +
          '   GitHub servers cannot reach your local machine.\n' +
          '\n' +
          '   For local development, use ngrok:\n' +
          '\n' +
          '   1. Run: npm run dev:tunnel\n' +
          '   2. Copy ngrok URL from terminal (e.g., https://abc123.ngrok-free.app)\n' +
          '   3. Update .env: WEBHOOK_BASE_URL=https://abc123.ngrok-free.app\n' +
          '   4. Restart the server\n' +
          '\n' +
          '   Quick start: npm run dev:full (starts API + ngrok together)\n' +
          '   Check tunnel: npm run dev:info\n' +
          '\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
      );
    } else if (this.webhookBaseUrl.includes('ngrok')) {
      this.logger.log(
        `✅ ngrok tunnel detected: ${this.webhookBaseUrl}\n` +
          `   Webhooks will work correctly.\n` +
          `   Dashboard: http://127.0.0.1:4040\n`,
      );
    } else {
      this.logger.log(`✅ Webhook base URL configured: ${this.webhookBaseUrl}`);
    }
  }

  async createWebhook(
    userId: string,
    repositoryId: string,
    dto: CreateWebhookDto,
  ): Promise<{ success: boolean; webhookId: string; webhookUrl: string }> {
    const repository = await this.repositoriesRepository.findById(repositoryId);

    if (repository?.userId !== userId) {
      throw new NotFoundException('Repository not found');
    }

    if (repository.webhookActive && repository.webhookId) {
      throw new BadRequestException(
        'Webhook already configured for this repository',
      );
    }

    const parsedUrl = this.gitValidationService.parseGitUrl(
      repository.repositoryUrl,
    );
    if (!parsedUrl) {
      throw new BadRequestException('Invalid repository URL');
    }

    const webhookSecret = this.encryptionService.generateRandomToken(32);

    const webhookUrl = `${this.webhookBaseUrl}/api/v1/webhooks/${repository.provider}/${repositoryId}`;

    try {
      const accessToken = this.encryptionService.decrypt(
        repository.accessTokenEncrypted,
      );

      let webhookId: string;

      if (repository.provider === GitProvider.GITHUB) {
        const webhook = await this.githubProviderService.createWebhook(
          { accessToken },
          parsedUrl.owner,
          parsedUrl.repo,
          {
            url: webhookUrl,
            events: dto.events,
            secret: webhookSecret,
          },
        );
        webhookId = webhook.id;
      } else {
        throw new BadRequestException(
          `Provider ${repository.provider} not yet supported`,
        );
      }

      await this.repositoriesRepository.update(repositoryId, {
        webhookId,
        webhookSecret,
        webhookUrl,
        webhookActive: true,
      });

      this.logger.log(
        `Webhook created for repository ${repositoryId}: ${webhookId}`,
      );

      return {
        success: true,
        webhookId,
        webhookUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create webhook for repository ${repositoryId}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create webhook: ${error.message}`,
      );
    }
  }

  async deleteWebhook(userId: string, repositoryId: string): Promise<void> {
    const repository = await this.repositoriesRepository.findById(repositoryId);

    if (repository?.userId !== userId) {
      throw new NotFoundException('Repository not found');
    }

    if (!repository.webhookId || !repository.webhookActive) {
      throw new BadRequestException(
        'No active webhook found for this repository',
      );
    }

    const parsedUrl = this.gitValidationService.parseGitUrl(
      repository.repositoryUrl,
    );
    if (!parsedUrl) {
      throw new BadRequestException('Invalid repository URL');
    }

    try {
      const accessToken = this.encryptionService.decrypt(
        repository.accessTokenEncrypted,
      );

      if (repository.provider === GitProvider.GITHUB) {
        await this.githubProviderService.deleteWebhook(
          { accessToken },
          parsedUrl.owner,
          parsedUrl.repo,
          repository.webhookId,
        );
      } else {
        throw new BadRequestException(
          `Provider ${repository.provider} not yet supported`,
        );
      }

      await this.repositoriesRepository.update(repositoryId, {
        webhookId: null,
        webhookSecret: null,
        webhookUrl: null,
        webhookActive: false,
      });

      this.logger.log(`Webhook deleted for repository ${repositoryId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete webhook for repository ${repositoryId}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete webhook: ${error.message}`,
      );
    }
  }

  async validateWebhookSignature(
    repositoryId: string,
    signature: string,
    payload: string,
  ): Promise<boolean> {
    const repository = await this.repositoriesRepository.findById(repositoryId);

    if (!repository?.webhookSecret) {
      this.logger.warn(
        `Webhook validation failed: repository not found or no secret`,
      );
      return false;
    }

    if (repository.provider === GitProvider.GITHUB) {
      return this.gitValidationService.validateGitHubWebhookSignature(
        payload,
        signature,
        repository.webhookSecret,
      );
    } else if (repository.provider === GitProvider.GITLAB) {
      return this.gitValidationService.validateGitLabWebhookToken(
        signature,
        repository.webhookSecret,
      );
    }

    this.logger.warn(
      `Webhook validation not supported for provider: ${repository.provider}`,
    );
    return false;
  }

  async listWebhooks(userId: string, repositoryId: string) {
    const repository = await this.repositoriesRepository.findById(repositoryId);

    if (repository?.userId !== userId) {
      throw new NotFoundException('Repository not found');
    }

    const parsedUrl = this.gitValidationService.parseGitUrl(
      repository.repositoryUrl,
    );
    if (!parsedUrl) {
      throw new BadRequestException('Invalid repository URL');
    }

    try {
      const accessToken = this.encryptionService.decrypt(
        repository.accessTokenEncrypted,
      );

      if (repository.provider === GitProvider.GITHUB) {
        return this.githubProviderService.listWebhooks(
          { accessToken },
          parsedUrl.owner,
          parsedUrl.repo,
        );
      }

      throw new BadRequestException(
        `Provider ${repository.provider} not yet supported`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to list webhooks for repository ${repositoryId}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to list webhooks: ${error.message}`,
      );
    }
  }
}
