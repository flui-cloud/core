import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  DeploymentEntity,
  BuildLogEntity,
  FrameworkTemplateEntity,
  FrameworkBuildScoresEntity,
} from './entities';
import {
  FrameworkRegistryService,
  ConfidenceScorerService,
  DetectionOrchestratorService,
  FrameworkBuildScoresService,
} from './services';
import { EnvVarDetectionModule } from '../env-var-detection/env-var-detection.module';

/**
 * Framework Core Module
 * Provides base infrastructure for framework detection and deployment
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      DeploymentEntity,
      BuildLogEntity,
      FrameworkTemplateEntity,
      FrameworkBuildScoresEntity,
    ]),
    EnvVarDetectionModule,
  ],
  providers: [
    FrameworkRegistryService,
    ConfidenceScorerService,
    DetectionOrchestratorService,
    FrameworkBuildScoresService,
  ],
  exports: [
    FrameworkRegistryService,
    ConfidenceScorerService,
    DetectionOrchestratorService,
    FrameworkBuildScoresService,
    EnvVarDetectionModule,
  ],
})
export class FrameworkCoreModule {}
