import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BuildAgentConfigService } from './services/build-agent-config.service';

/**
 * Tiny standalone module that exposes `BuildAgentConfigService` so that both
 * `AppBuildsModule` and `ApplicationsModule` can read the in-cluster build
 * agent master switch without creating a circular dependency between them
 * (`AppBuildsModule` already imports `ApplicationsModule`).
 */
@Module({
  imports: [ConfigModule],
  providers: [BuildAgentConfigService],
  exports: [BuildAgentConfigService],
})
export class BuildAgentConfigModule {}
