import { Module } from '@nestjs/common';
import { EnvVarDetectorService } from './services/env-var-detector.service';

/**
 * EnvVarDetectionModule
 *
 * Provides pre-deploy environment variable detection for source code repositories.
 * Implements a priority-based detection hierarchy:
 *   1. flui.env (explicit declaration)
 *   2. Framework-specific config files (.env.example, config.yaml, etc.)
 *   3. Dockerfile ENV directives
 *   4. Fallback (keys only, isFallback=true)
 *
 * Scope: source code repos only (GIT_BUILD / user-provided Dockerfile).
 * DOCKER_IMAGE deployments do not use this module.
 */
@Module({
  providers: [EnvVarDetectorService],
  exports: [EnvVarDetectorService],
})
export class EnvVarDetectionModule {}
