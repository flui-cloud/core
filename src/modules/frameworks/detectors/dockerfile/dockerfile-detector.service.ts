import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import {
  IFrameworkDetector,
  IFrameworkMetadata,
  IDetectionContext,
  IDetectionResult,
  IBuildPlan,
} from '../../framework-core/interfaces';
import { FrameworkType, DeployStrategy } from '../../framework-core/enums';

/**
 * Dockerfile Passthrough Detector
 * Detects and uses existing Dockerfile in repository
 * Highest priority - if Dockerfile exists, use it as-is
 */
@Injectable()
export class DockerfileDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(DockerfileDetectorService.name);

  /**
   * Get detector metadata
   */
  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.DOCKERFILE,
      displayName: 'Dockerfile (Custom)',
      detectorName: 'dockerfile-passthrough',
      detectorVersion: '1.0.0',
      supportedVersions: ['*'],
      priority: 100, // Highest priority
      category: 'passthrough',
      official: true,
    };
  }

  /**
   * Quick check if Dockerfile exists in root
   */
  canDetect(context: IDetectionContext): boolean {
    return context.rootFiles.includes('Dockerfile');
  }

  /**
   * Detect Dockerfile and return 100% confidence
   */
  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Dockerfile detector: Checking for Dockerfile');

    if (!this.canDetect(context)) {
      return {
        framework: FrameworkType.DOCKERFILE,
        confidence: 0,
        detectorName: this.getMetadata().detectorName,
      };
    }

    // Read Dockerfile to extract some metadata
    const dockerfilePath = path.join(context.repositoryPath, 'Dockerfile');
    const dockerfileContent = await fs.readFile(dockerfilePath, 'utf-8');

    // Try to extract port from EXPOSE directive
    const portMatch = /EXPOSE\s+(\d+)/i.exec(dockerfileContent);
    const exposedPort = portMatch
      ? Number.parseInt(portMatch[1], 10)
      : undefined;

    // Try to detect base image
    const fromMatch = /FROM\s+([^\s]+)/i.exec(dockerfileContent);
    const baseImage = fromMatch ? fromMatch[1] : undefined;

    const warnings: string[] = [];

    // Warn if no EXPOSE directive found
    if (!exposedPort) {
      warnings.push(
        'No EXPOSE directive found in Dockerfile. You will need to specify the port in .flui.yaml',
      );
    }

    // Warn if using :latest tag
    if (baseImage?.includes(':latest')) {
      warnings.push(
        'Using :latest tag in base image is not recommended for production deployments',
      );
    }

    return {
      framework: FrameworkType.DOCKERFILE,
      confidence: 100, // Absolute certainty
      detectorName: this.getMetadata().detectorName,
      warnings,
      metadata: {
        exposedPort,
        baseImage,
        dockerfileLines: dockerfileContent.split('\n').length,
      },
    };
  }

  /**
   * Generate build plan using existing Dockerfile
   */
  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    this.logger.log('Generating build plan for Dockerfile passthrough');

    // Read Dockerfile content
    const dockerfilePath = path.join(context.repositoryPath, 'Dockerfile');
    const dockerfileContent = await fs.readFile(dockerfilePath, 'utf-8');

    // Extract port from detection metadata or .flui.yaml or default
    const port =
      context.fluiConfig?.runtime?.port ||
      detectionResult.metadata?.exposedPort ||
      8080;

    // Use .flui.yaml config if provided, otherwise use sensible defaults
    const defaultResources = {
      cpu: {
        request: '250m',
        limit: '1000m',
      },
      memory: {
        request: '256Mi',
        limit: '512Mi',
      },
    };

    const resources = {
      cpu: {
        request:
          context.fluiConfig?.resources?.cpu?.request ||
          defaultResources.cpu.request,
        limit:
          context.fluiConfig?.resources?.cpu?.limit ||
          defaultResources.cpu.limit,
      },
      memory: {
        request:
          context.fluiConfig?.resources?.memory?.request ||
          defaultResources.memory.request,
        limit:
          context.fluiConfig?.resources?.memory?.limit ||
          defaultResources.memory.limit,
      },
    };

    const healthCheck = context.fluiConfig?.runtime?.healthCheck?.enabled
      ? {
          enabled: true,
          path: context.fluiConfig.runtime.healthCheck.path || '/health',
          port: context.fluiConfig.runtime.healthCheck.port || port,
          initialDelaySeconds:
            context.fluiConfig.runtime.healthCheck.initialDelaySeconds || 30,
          periodSeconds:
            context.fluiConfig.runtime.healthCheck.periodSeconds || 10,
          timeoutSeconds:
            context.fluiConfig.runtime.healthCheck.timeoutSeconds || 5,
          successThreshold:
            context.fluiConfig.runtime.healthCheck.successThreshold || 1,
          failureThreshold:
            context.fluiConfig.runtime.healthCheck.failureThreshold || 3,
        }
      : undefined;

    const scaling = context.fluiConfig?.scaling?.enabled
      ? {
          enabled: true,
          minReplicas: context.fluiConfig.scaling.minReplicas || 1,
          maxReplicas: context.fluiConfig.scaling.maxReplicas || 3,
          targetCPUUtilization:
            context.fluiConfig.scaling.targetCPUUtilization || 70,
          targetMemoryUtilization:
            context.fluiConfig.scaling.targetMemoryUtilization,
        }
      : undefined;

    const buildPlan: IBuildPlan = {
      framework: FrameworkType.DOCKERFILE,
      version: 'custom',
      dockerfile: dockerfileContent,
      buildContext: '.',
      buildArgs: context.fluiConfig?.build?.args || {},
      buildEnv: context.fluiConfig?.build?.env || [],
      runtimeEnv: context.fluiConfig?.runtime?.env || [],
      resources,
      healthCheck,
      networking: {
        port,
        protocol: context.fluiConfig?.runtime?.protocol || 'http',
        ingressEnabled: true,
      },
      scaling,
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'passthrough',
        generatedAt: new Date(),
        userOverrides: context.fluiConfig ? ['dockerfile'] : [],
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.DOCKERFILE,
      deployabilityScore: 1,
      deployabilityFactors: {
        frameworkRecognized: false,
        repoClarity: 1,
        artifactPredictability: 1,
        runtimePredictability: 1,
        buildReproducibility: 1,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
    };

    return buildPlan;
  }
}
