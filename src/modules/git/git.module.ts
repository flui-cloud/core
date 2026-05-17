import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../shared/shared.module';
import { GitCloneService } from './services/git-clone.service';
import { GitHubProviderService } from './services/github-provider.service';

@Module({
  imports: [ConfigModule, SharedModule],
  providers: [GitCloneService, GitHubProviderService],
  exports: [GitCloneService, GitHubProviderService],
})
export class GitModule {}
