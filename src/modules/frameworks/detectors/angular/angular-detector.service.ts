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
 * Angular Framework Detector
 * Detects Angular applications (SPA mode)
 * Supports Angular 16.x and 17.x
 */
@Injectable()
export class AngularDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(AngularDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.ANGULAR,
      displayName: 'Angular',
      detectorName: 'angular-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['16.x', '17.x', '18.x'],
      priority: 80,
      category: 'frontend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('angular.json') ||
      !!context.packageJson?.dependencies?.['@angular/core']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Angular detector: Starting detection');

    let confidence = 0;
    const warnings: string[] = [];
    const features: string[] = [];

    // Check for angular.json (strongest indicator)
    if (context.rootFiles.includes('angular.json')) {
      confidence = 95;
      this.logger.debug('Found angular.json (+95)');
    }

    // Check for @angular/core dependency
    const hasAngularCore =
      !!context.packageJson?.dependencies?.['@angular/core'];
    if (hasAngularCore) {
      confidence += context.rootFiles.includes('angular.json') ? 5 : 85;
      this.logger.debug(
        `Found @angular/core in dependencies (+${context.rootFiles.includes('angular.json') ? 5 : 85})`,
      );
    }

    if (confidence === 0) {
      return {
        framework: FrameworkType.ANGULAR,
        confidence: 0,
        detectorName: this.getMetadata().detectorName,
      };
    }

    // Extract version
    const version = this.extractVersion(context);
    const majorVersion = this.extractMajorVersion(version);

    // Check version support
    if (majorVersion && !['16', '17', '18'].includes(majorVersion)) {
      warnings.push(
        `Angular version ${version} may not be fully supported. Recommended: 16.x, 17.x, 18.x`,
      );
    }

    // Detect features
    await this.detectFeatures(context, features);

    // Detect build configuration
    const buildConfig = await this.detectBuildConfiguration(context);

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
      framework: FrameworkType.ANGULAR,
      confidence,
      version,
      majorVersion,
      buildMode: BuildMode.SPA,
      features,
      packageManager: context.packageManager,
      nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {
        buildConfig,
        hasStandaloneComponents: features.includes('standalone-components'),
      },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    this.logger.log('Generating build plan for Angular');

    const nodeVersion = detectionResult.nodeVersion || '20';
    const packageManager = detectionResult.packageManager || 'npm';

    // Generate Dockerfile for Angular SPA
    const dockerfile = this.generateSPADockerfile(
      nodeVersion,
      packageManager,
      context,
    );

    // Default port for nginx
    const port = context.fluiConfig?.runtime?.port || 80;

    // Resource requirements (Angular build can be CPU intensive)
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

    // Health check for nginx
    const healthCheck = context.fluiConfig?.runtime?.healthCheck?.enabled
      ? {
          enabled: true,
          path: context.fluiConfig.runtime.healthCheck.path || '/',
          port: context.fluiConfig.runtime.healthCheck.port || port,
          initialDelaySeconds:
            context.fluiConfig.runtime.healthCheck.initialDelaySeconds || 10,
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
          initialDelaySeconds: 10,
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
      framework: FrameworkType.ANGULAR,
      version: detectionResult.version,
      buildMode: BuildMode.SPA,
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
        templateVersion: `angular-${detectionResult.majorVersion}-spa`,
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      ...(() => {
        const hasBuildScript = !!context.packageJson?.scripts?.build;
        const hasLockfile = !!context.lockfilePresent;
        const strategy =
          hasBuildScript && hasLockfile
            ? DeployStrategy.RAILPACK_DIRECT
            : DeployStrategy.RAILPACK_WITH_OVERRIDES;
        let score: number;
        if (hasBuildScript && hasLockfile) score = 0.88;
        else if (hasBuildScript) score = 0.75;
        else score = 0.7;
        const warnings = [...(detectionResult.warnings ?? [])];
        if (!hasBuildScript)
          warnings.push('No build script found in package.json');
        return {
          deployStrategy: strategy,
          deployabilityScore: score,
          deployabilityFactors: {
            frameworkRecognized: true,
            repoClarity: 0.95,
            artifactPredictability: 0.9,
            runtimePredictability: 0.95,
            buildReproducibility: hasLockfile ? 0.9 : 0.7,
          },
          suggestedBuildCommand: hasBuildScript ? undefined : 'npm run build',
          projectWarnings: warnings,
          requiresUserConfirmation: score < 0.82,
          userChoicesRequired: [],
        };
      })(),
    };
  }

  /**
   * Extract Angular version from package.json
   */
  private extractVersion(context: IDetectionContext): string {
    return context.packageJson?.dependencies?.['@angular/core'] || 'latest';
  }

  /**
   * Extract major version number
   */
  private extractMajorVersion(version: string): string | undefined {
    const match = /(\d+)/.exec(version);
    return match ? match[1] : undefined;
  }

  /**
   * Detect Angular features
   */
  private async detectFeatures(
    context: IDetectionContext,
    features: string[],
  ): Promise<void> {
    let hasStandalone = false;
    for (const f of context.files) {
      if (!f.endsWith('.component.ts')) continue;
      try {
        const content = await fs.readFile(
          path.join(context.repositoryPath, f),
          'utf-8',
        );
        if (content.includes('standalone: true')) {
          hasStandalone = true;
          break;
        }
      } catch {
        /* */
      }
    }
    if (hasStandalone) {
      features.push('standalone-components');
    }

    // Routing
    const hasRouting = context.files.some(
      (f) => f.includes('routing') || f.includes('app-routing.module.ts'),
    );
    if (hasRouting) {
      features.push('routing');
    }

    // Services
    const hasServices = context.files.some((f) => f.endsWith('.service.ts'));
    if (hasServices) {
      features.push('services');
    }
  }

  /**
   * Detect build configuration from angular.json
   */
  private async detectBuildConfiguration(
    context: IDetectionContext,
  ): Promise<any> {
    if (!context.rootFiles.includes('angular.json')) {
      return null;
    }

    try {
      const angularJsonPath = path.join(context.repositoryPath, 'angular.json');
      const content = await fs.readFile(angularJsonPath, 'utf-8');
      const config = JSON.parse(content);

      // Extract default project and build options
      const defaultProject = config.defaultProject;
      const projects = config.projects;

      if (defaultProject && projects[defaultProject]) {
        const buildOptions = projects[defaultProject].architect?.build?.options;
        return {
          outputPath: buildOptions?.outputPath || 'dist',
          index: buildOptions?.index || 'src/index.html',
          main: buildOptions?.main || 'src/main.ts',
        };
      }

      return null;
    } catch (error) {
      this.logger.warn(`Could not parse angular.json: ${error.message}`);
      return null;
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

    // Recommended based on Angular version
    if (majorVersion === '18') {
      return '20.9.0';
    } else if (majorVersion === '17') {
      return '18.13.0';
    } else if (majorVersion === '16') {
      return '18.10.0';
    }

    return undefined;
  }

  /**
   * Generate Dockerfile for Angular SPA
   */
  private generateSPADockerfile(
    nodeVersion: string,
    packageManager: string,
    context: IDetectionContext,
  ): string {
    const installCmd = this.getInstallCommand(packageManager);
    const buildCmd =
      context.fluiConfig?.build?.command ||
      context.packageJson?.scripts?.build ||
      `${packageManager} run build`;

    const outputPath =
      context.fluiConfig?.build?.outputDir ||
      context.metadata?.buildConfig?.outputPath ||
      'dist';

    return String.raw`
# syntax=docker/dockerfile:1
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ${this.getLockfile(packageManager)} ./
RUN ${installCmd}

# Copy source and build
COPY . .
RUN ${buildCmd}

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/${outputPath} /usr/share/nginx/html

# Copy nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \\$uri \\$uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
EOF

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
