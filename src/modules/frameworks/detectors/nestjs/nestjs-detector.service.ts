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
import {
  FrameworkType,
  BuildMode,
  DeployStrategy,
} from '../../framework-core/enums';

/**
 * NestJS Framework Detector
 * Detects NestJS backend applications
 * Supports NestJS 9.x and 10.x
 */
@Injectable()
export class NestJsDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(NestJsDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.NESTJS,
      displayName: 'NestJS',
      detectorName: 'nestjs-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['9.x', '10.x', '11.x'],
      priority: 75,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('nest-cli.json') ||
      !!context.packageJson?.dependencies?.['@nestjs/core']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('NestJS detector: Starting detection');

    let confidence = 0;
    const warnings: string[] = [];
    const features: string[] = [];

    // Check for nest-cli.json (strongest indicator)
    if (context.rootFiles.includes('nest-cli.json')) {
      confidence = 95;
      this.logger.debug('Found nest-cli.json (+95)');
    }

    // Check for @nestjs/core dependency
    const hasNestCore = !!context.packageJson?.dependencies?.['@nestjs/core'];
    if (hasNestCore) {
      confidence += context.rootFiles.includes('nest-cli.json') ? 5 : 85;
      this.logger.debug(
        `Found @nestjs/core in dependencies (+${context.rootFiles.includes('nest-cli.json') ? 5 : 85})`,
      );
    }

    if (confidence === 0) {
      return {
        framework: FrameworkType.NESTJS,
        confidence: 0,
        detectorName: this.getMetadata().detectorName,
      };
    }

    // Extract version
    const version = this.extractVersion(context);
    const majorVersion = this.extractMajorVersion(version);

    // Check version support
    if (majorVersion && !['9', '10', '11'].includes(majorVersion)) {
      warnings.push(
        `NestJS version ${version} may not be fully supported. Recommended: 9.x, 10.x, 11.x`,
      );
    }

    // Detect features and API type
    await this.detectFeatures(context, features);

    // Detect TypeScript configuration
    const tsConfig = await this.detectTypeScriptConfig(context);

    // Check for recommended setup
    if (!context.lockfilePresent) {
      warnings.push('No lockfile found. Recommended for reproducible builds.');
    }

    const nodeVersion = this.detectNodeVersion(context, majorVersion);
    if (!nodeVersion) {
      warnings.push(
        'No Node.js version specified. Add .nvmrc or specify in package.json engines.',
      );
    }

    // Detect main entry point
    const entryPoint = await this.detectEntryPoint(context);

    return {
      framework: FrameworkType.NESTJS,
      confidence,
      version,
      majorVersion,
      buildMode: BuildMode.PRODUCTION,
      features,
      packageManager: context.packageManager,
      nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {
        tsConfig,
        entryPoint,
        hasGraphQL: features.includes('graphql'),
        hasMicroservices: features.includes('microservices'),
        hasWebsockets: features.includes('websockets'),
      },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', '.env.template'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    this.logger.log('Generating build plan for NestJS');

    const nodeVersion = detectionResult.nodeVersion || '20';
    const packageManager = detectionResult.packageManager || 'npm';
    const entryPoint = detectionResult.metadata?.entryPoint || 'main';

    // Generate Dockerfile for NestJS API
    const dockerfile = this.generateProductionDockerfile(
      nodeVersion,
      packageManager,
      entryPoint,
      context,
    );

    // Default port for NestJS
    const port = context.fluiConfig?.runtime?.port || 3000;

    // Resource requirements (NestJS is generally lightweight)
    const defaultResources = {
      cpu: {
        request: '250m',
        limit: '500m',
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

    // Health check configuration
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
      : {
          enabled: true,
          path: '/',
          port,
          initialDelaySeconds: 30,
          periodSeconds: 10,
          timeoutSeconds: 5,
          successThreshold: 1,
          failureThreshold: 3,
        };

    // Scaling configuration
    const scaling = context.fluiConfig?.scaling?.enabled
      ? {
          enabled: true,
          minReplicas: context.fluiConfig.scaling.minReplicas || 2,
          maxReplicas: context.fluiConfig.scaling.maxReplicas || 5,
          targetCPUUtilization:
            context.fluiConfig.scaling.targetCPUUtilization || 70,
          targetMemoryUtilization:
            context.fluiConfig.scaling.targetMemoryUtilization,
        }
      : undefined;

    return {
      framework: FrameworkType.NESTJS,
      version: detectionResult.version,
      buildMode: BuildMode.PRODUCTION,
      dockerfile,
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
        templateVersion: `nestjs-${detectionResult.majorVersion}`,
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      ...this.buildAdvisorFields(detectionResult, context, entryPoint),
    };
  }

  private buildAdvisorFields(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
    entryPoint: string,
  ) {
    const scripts = context.packageJson?.scripts ?? {};
    const startProdScript = scripts['start:prod'];
    const startScript = scripts['start'];
    const hasLockfile = !!context.lockfilePresent;

    // Build userChoicesRequired: expose start options when multiple are available
    const userChoicesRequired = [];
    const startOptions: Array<{ label: string; value: string }> = [];
    if (startProdScript)
      startOptions.push({
        label: `start:prod — ${startProdScript}`,
        value: startProdScript,
      });
    startOptions.push({
      label: `node dist/${entryPoint}`,
      value: `node dist/${entryPoint}`,
    });
    if (startScript && startScript !== startProdScript) {
      startOptions.push({
        label: `start — ${startScript}`,
        value: startScript,
      });
    }
    if (startOptions.length > 1 && !startProdScript) {
      userChoicesRequired.push({
        field: 'startCommand' as const,
        description:
          'Multiple start options detected — select the production start command',
        options: startOptions,
        suggestedIndex: 0,
      });
    }

    const suggestedStartCommand = startProdScript ?? `node dist/${entryPoint}`;
    const suggestedBuildCommand = scripts['build'] ?? 'npm run build';
    const deployabilityScore = hasLockfile ? 0.82 : 0.72;
    const requiresUserConfirmation =
      userChoicesRequired.length > 0 || deployabilityScore < 0.82;
    const projectWarnings = [...(detectionResult.warnings ?? [])];
    if (!hasLockfile)
      projectWarnings.push(
        'No lockfile found — builds may not be reproducible',
      );

    return {
      deployStrategy: DeployStrategy.RAILPACK_WITH_OVERRIDES,
      deployabilityScore,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.85,
        artifactPredictability: 0.8,
        runtimePredictability: startProdScript ? 0.9 : 0.75,
        buildReproducibility: hasLockfile ? 0.9 : 0.65,
      },
      suggestedBuildCommand,
      suggestedStartCommand,
      projectWarnings,
      requiresUserConfirmation,
      userChoicesRequired,
    };
  }

  /**
   * Extract NestJS version from package.json
   */
  private extractVersion(context: IDetectionContext): string {
    return context.packageJson?.dependencies?.['@nestjs/core'] || 'latest';
  }

  /**
   * Extract major version number
   */
  private extractMajorVersion(version: string): string | undefined {
    const match = /(\d+)/.exec(version);
    return match ? match[1] : undefined;
  }

  /**
   * Detect NestJS features
   */
  private async detectFeatures(
    context: IDetectionContext,
    features: string[],
  ): Promise<void> {
    // GraphQL
    const hasGraphQL = !!context.packageJson?.dependencies?.['@nestjs/graphql'];
    if (hasGraphQL) {
      features.push('graphql');
    }

    // Microservices
    const hasMicroservices =
      !!context.packageJson?.dependencies?.['@nestjs/microservices'];
    if (hasMicroservices) {
      features.push('microservices');
    }

    // WebSockets
    const hasWebsockets =
      !!context.packageJson?.dependencies?.['@nestjs/websockets'];
    if (hasWebsockets) {
      features.push('websockets');
    }

    // TypeORM
    const hasTypeORM = !!context.packageJson?.dependencies?.['@nestjs/typeorm'];
    if (hasTypeORM) {
      features.push('typeorm');
    }

    // Mongoose
    const hasMongoose =
      !!context.packageJson?.dependencies?.['@nestjs/mongoose'];
    if (hasMongoose) {
      features.push('mongoose');
    }

    // Swagger
    const hasSwagger = !!context.packageJson?.dependencies?.['@nestjs/swagger'];
    if (hasSwagger) {
      features.push('swagger');
    }

    // Bull (Queue)
    const hasBull = !!context.packageJson?.dependencies?.['@nestjs/bull'];
    if (hasBull) {
      features.push('bull-queue');
    }
  }

  /**
   * Detect TypeScript configuration
   */
  private async detectTypeScriptConfig(
    context: IDetectionContext,
  ): Promise<any> {
    if (!context.rootFiles.includes('tsconfig.json')) {
      return null;
    }

    try {
      const tsconfigPath = path.join(context.repositoryPath, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      return {
        outDir: config.compilerOptions?.outDir || 'dist',
        rootDir: config.compilerOptions?.rootDir || 'src',
      };
    } catch (error) {
      this.logger.warn(`Could not parse tsconfig.json: ${error.message}`);
      return null;
    }
  }

  /**
   * Detect main entry point
   */
  private async detectEntryPoint(context: IDetectionContext): Promise<string> {
    // Check nest-cli.json
    if (context.rootFiles.includes('nest-cli.json')) {
      try {
        const nestCliPath = path.join(context.repositoryPath, 'nest-cli.json');
        const content = await fs.readFile(nestCliPath, 'utf-8');
        const config = JSON.parse(content);

        if (config.entryFile) {
          return config.entryFile;
        }
      } catch (error) {
        this.logger.warn(`Could not parse nest-cli.json: ${error.message}`);
      }
    }

    return 'main';
  }

  /**
   * Detect recommended Node.js version
   */
  private detectNodeVersion(
    context: IDetectionContext,
    majorVersion?: string,
  ): string | undefined {
    // From .nvmrc
    if (context.nodeVersion) {
      return context.nodeVersion;
    }

    // From package.json engines
    if (context.packageJson?.engines?.node) {
      return context.packageJson.engines.node;
    }

    // Recommended based on NestJS version
    if (majorVersion === '11' || majorVersion === '10') {
      return '20.9.0';
    } else if (majorVersion === '9') {
      return '18.12.0';
    }

    return undefined;
  }

  /**
   * Generate production Dockerfile for NestJS
   */
  private generateProductionDockerfile(
    nodeVersion: string,
    packageManager: string,
    entryPoint: string,
    context: IDetectionContext,
  ): string {
    const installCmd = this.getInstallCommand(packageManager);
    const buildCmd =
      context.fluiConfig?.build?.command ||
      context.packageJson?.scripts?.build ||
      `${packageManager} run build`;

    const startCmd = context.packageJson?.scripts?.['start:prod']
      ? `${packageManager} run start:prod`
      : `node dist/${entryPoint}`;

    return `
# syntax=docker/dockerfile:1
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ${this.getLockfile(packageManager)} ./
RUN ${installCmd}

# Copy source and build
COPY . .
RUN ${buildCmd}

# Production stage
FROM node:${nodeVersion}-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3000

CMD [${startCmd
      .split(' ')
      .map((s) => `"${s}"`)
      .join(', ')}]
    `.trim();
  }

  /**
   * Get install command for package manager
   */
  private getInstallCommand(packageManager: string): string {
    const commands = {
      npm: 'npm ci --only=production',
      yarn: 'yarn install --frozen-lockfile --production',
      pnpm: 'pnpm install --frozen-lockfile --prod',
      bun: 'bun install --frozen-lockfile --production',
    };
    return commands[packageManager] || commands.npm;
  }

  /**
   * Get lockfile name for package manager
   */
  private getLockfile(packageManager: string): string {
    const lockfiles = {
      npm: 'package-lock.json',
      yarn: 'yarn.lock',
      pnpm: 'pnpm-lock.yaml',
      bun: 'bun.lockb',
    };
    return lockfiles[packageManager] || lockfiles.npm;
  }
}
