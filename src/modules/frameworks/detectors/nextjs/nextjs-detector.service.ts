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
 * Next.js Framework Detector
 * Detects Next.js applications and determines build mode (SSR vs Static)
 * Supports Next.js 13.x and 14.x
 */
@Injectable()
export class NextJsDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(NextJsDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.NEXTJS,
      displayName: 'Next.js',
      detectorName: 'nextjs-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['13.x', '14.x', '15.x'],
      priority: 85,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // Quick check: Next.js config file exists
    return (
      context.rootFiles.includes('next.config.js') ||
      context.rootFiles.includes('next.config.mjs') ||
      context.rootFiles.includes('next.config.ts') ||
      !!context.packageJson?.dependencies?.['next']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Next.js detector: Starting detection');

    let confidence = 0;
    const warnings: string[] = [];
    const features: string[] = [];

    // Check for Next.js config file (strongest indicator)
    const hasConfigFile =
      context.rootFiles.includes('next.config.js') ||
      context.rootFiles.includes('next.config.mjs') ||
      context.rootFiles.includes('next.config.ts');

    if (hasConfigFile) {
      confidence = 95;
      this.logger.debug('Found Next.js config file (+95)');
    }

    // Check package.json dependencies
    const hasNextDependency = !!context.packageJson?.dependencies?.['next'];
    if (hasNextDependency) {
      confidence += hasConfigFile ? 5 : 85;
      this.logger.debug(
        `Found 'next' in dependencies (+${hasConfigFile ? 5 : 85})`,
      );
    }

    if (confidence === 0) {
      return {
        framework: FrameworkType.NEXTJS,
        confidence: 0,
        detectorName: this.getMetadata().detectorName,
      };
    }

    // Extract version
    const version = this.extractVersion(context);
    const majorVersion = this.extractMajorVersion(version);

    // Check version support
    if (majorVersion && !['13', '14', '15'].includes(majorVersion)) {
      warnings.push(
        `Next.js version ${version} may not be fully supported. Recommended: 13.x, 14.x, 15.x`,
      );
    }

    // Detect build mode (SSR vs Static export)
    const buildMode = await this.detectBuildMode(context);

    // Detect App Router vs Pages Router
    const routerType = await this.detectRouterType(context);
    if (routerType) {
      features.push(routerType);
    }

    // Detect features
    await this.detectFeatures(context, features);

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

    return {
      framework: FrameworkType.NEXTJS,
      confidence,
      version,
      majorVersion,
      buildMode,
      features,
      packageManager: context.packageManager,
      nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {
        routerType,
        hasAppDir: features.includes('app-router'),
        hasPagesDir: features.includes('pages-router'),
        hasApiRoutes: features.includes('api-routes'),
      },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', '.env.local.example', '.env.template'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    this.logger.log('Generating build plan for Next.js');

    const buildMode = detectionResult.buildMode || BuildMode.SSR;
    const nodeVersion = detectionResult.nodeVersion || '20';
    const packageManager = detectionResult.packageManager || 'npm';

    // Generate appropriate Dockerfile
    const dockerfile =
      buildMode === BuildMode.STATIC
        ? this.generateStaticDockerfile(nodeVersion, packageManager, context)
        : this.generateSSRDockerfile(nodeVersion, packageManager, context);

    // Default port for Next.js
    const port = context.fluiConfig?.runtime?.port || 3000;

    // Resource requirements (Next.js can be memory-intensive)
    const defaultResources = {
      cpu: {
        request: '500m',
        limit: '1000m',
      },
      memory: {
        request: '512Mi',
        limit: '1Gi',
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
          path: context.fluiConfig.runtime.healthCheck.path || '/api/health',
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
          maxReplicas: context.fluiConfig.scaling.maxReplicas || 10,
          targetCPUUtilization:
            context.fluiConfig.scaling.targetCPUUtilization || 70,
          targetMemoryUtilization:
            context.fluiConfig.scaling.targetMemoryUtilization,
        }
      : undefined;

    return {
      framework: FrameworkType.NEXTJS,
      version: detectionResult.version,
      buildMode,
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
        templateVersion: `nextjs-${detectionResult.majorVersion}-${buildMode}`,
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: context.lockfilePresent ? 0.93 : 0.82,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 1,
        artifactPredictability: 0.95,
        runtimePredictability: 0.95,
        buildReproducibility: context.lockfilePresent ? 0.95 : 0.75,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
    };
  }

  /**
   * Extract Next.js version from package.json
   */
  private extractVersion(context: IDetectionContext): string {
    return context.packageJson?.dependencies?.['next'] || 'latest';
  }

  /**
   * Extract major version number
   */
  private extractMajorVersion(version: string): string | undefined {
    const match = /(\d+)/.exec(version);
    return match ? match[1] : undefined;
  }

  /**
   * Detect build mode (SSR vs Static)
   */
  private async detectBuildMode(
    context: IDetectionContext,
  ): Promise<BuildMode> {
    // Check .flui.yaml override
    if (context.fluiConfig?.framework?.mode === 'static') {
      return BuildMode.STATIC;
    }

    // Check next.config.js for output: 'export'
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];

    for (const configFile of configFiles) {
      if (context.rootFiles.includes(configFile)) {
        try {
          const configPath = path.join(context.repositoryPath, configFile);
          const configContent = await fs.readFile(configPath, 'utf-8');

          // Check for static export configuration
          if (
            configContent.includes('output:') &&
            (configContent.includes('"export"') ||
              configContent.includes("'export'"))
          ) {
            return BuildMode.STATIC;
          }

          // Check for standalone mode
          if (
            configContent.includes('output:') &&
            (configContent.includes('"standalone"') ||
              configContent.includes("'standalone'"))
          ) {
            return BuildMode.STANDALONE;
          }
        } catch (error) {
          this.logger.warn(`Could not read ${configFile}: ${error.message}`);
        }
      }
    }

    // Default to SSR
    return BuildMode.SSR;
  }

  /**
   * Detect App Router vs Pages Router
   */
  private async detectRouterType(
    context: IDetectionContext,
  ): Promise<string | undefined> {
    const hasAppDir = context.files.some((f) => f.startsWith('app/'));
    const hasPagesDir = context.files.some((f) => f.startsWith('pages/'));

    if (hasAppDir && hasPagesDir) {
      return 'hybrid-router';
    } else if (hasAppDir) {
      return 'app-router';
    } else if (hasPagesDir) {
      return 'pages-router';
    }

    return undefined;
  }

  /**
   * Detect Next.js features
   */
  private async detectFeatures(
    context: IDetectionContext,
    features: string[],
  ): Promise<void> {
    // API Routes
    const hasApiRoutes = context.files.some(
      (f) => f.includes('pages/api/') || f.includes('app/api/'),
    );
    if (hasApiRoutes) {
      features.push('api-routes');
    }

    // Middleware
    const hasMiddleware =
      context.rootFiles.includes('middleware.ts') ||
      context.rootFiles.includes('middleware.js');
    if (hasMiddleware) {
      features.push('middleware');
    }

    let usesNextImage = false;
    for (const f of context.files) {
      if (!(f.endsWith('.tsx') || f.endsWith('.jsx'))) continue;
      try {
        const content = await fs.readFile(
          path.join(context.repositoryPath, f),
          'utf-8',
        );
        if (content.includes('next/image')) {
          usesNextImage = true;
          break;
        }
      } catch {
        /* */
      }
    }
    if (usesNextImage) {
      features.push('image-optimization');
    }
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

    // Recommended based on Next.js version
    if (majorVersion === '15') {
      return '20.9.0';
    } else if (majorVersion === '14') {
      return '18.17.0';
    } else if (majorVersion === '13') {
      return '18.17.0';
    }

    return undefined;
  }

  /**
   * Generate Dockerfile for SSR/Standalone mode
   */
  private generateSSRDockerfile(
    nodeVersion: string,
    packageManager: string,
    context: IDetectionContext,
  ): string {
    const installCmd = this.getInstallCommand(packageManager);
    const buildCmd =
      context.fluiConfig?.build?.command ||
      context.packageJson?.scripts?.build ||
      `${packageManager} run build`;

    return `
# syntax=docker/dockerfile:1
FROM node:${nodeVersion}-alpine AS deps
WORKDIR /app

# Install dependencies based on package manager
COPY package.json ${this.getLockfile(packageManager)} ./
RUN ${installCmd}

FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

RUN ${buildCmd}

FROM node:${nodeVersion}-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
    `.trim();
  }

  /**
   * Generate Dockerfile for Static export
   */
  private generateStaticDockerfile(
    nodeVersion: string,
    packageManager: string,
    context: IDetectionContext,
  ): string {
    const installCmd = this.getInstallCommand(packageManager);
    const buildCmd =
      context.fluiConfig?.build?.command ||
      context.packageJson?.scripts?.build ||
      `${packageManager} run build`;

    return `
# syntax=docker/dockerfile:1
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app

COPY package.json ${this.getLockfile(packageManager)} ./
RUN ${installCmd}

COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN ${buildCmd}

FROM nginx:alpine AS runner
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
    `.trim();
  }

  /**
   * Get install command for package manager
   */
  private getInstallCommand(packageManager: string): string {
    const commands = {
      npm: 'npm ci',
      yarn: 'yarn install --frozen-lockfile',
      pnpm: 'pnpm install --frozen-lockfile',
      bun: 'bun install --frozen-lockfile',
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
