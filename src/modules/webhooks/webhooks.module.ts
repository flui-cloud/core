import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from '../applications/entities/application.entity';
import { ApplicationsModule } from '../applications/applications.module';
import { ImageRegistryModule } from '../image-registry/image-registry.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { GitHubAppWebhookService } from './services/github-app-webhook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    ApplicationsModule,
    ImageRegistryModule,
    RepositoriesModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, GitHubAppWebhookService],
})
export class WebhooksModule {}
