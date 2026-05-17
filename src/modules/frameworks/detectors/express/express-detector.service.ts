import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class ExpressDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(ExpressDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.EXPRESS,
      displayName: 'Express.js',
      detectorName: 'express-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['4.x', '5.x'],
      priority: 55, // Low — many frameworks use express internally
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    const hasExpress = !!context.packageJson?.dependencies?.['express'];
    // Exclude projects that are clearly a higher-level framework
    const isNest = !!context.packageJson?.dependencies?.['@nestjs/core'];
    const isNuxt = !!context.packageJson?.dependencies?.['nuxt'];
    return hasExpress && !isNest && !isNuxt;
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Express detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.packageJson?.dependencies?.['express']) confidence += 60;

    // Boost if package.json looks like a standalone express app
    if (context.packageJson?.main) confidence += 15;
    if (context.packageJson?.scripts?.['start']) confidence += 10;
    if (context.packageJson?.scripts?.['dev']) confidence += 5;

    if (context.packageJson?.dependencies?.['express-validator'])
      features.push('validation');
    if (context.packageJson?.dependencies?.['cors']) features.push('cors');
    if (context.packageJson?.dependencies?.['helmet']) features.push('helmet');
    if (
      context.packageJson?.dependencies?.['mongoose'] ||
      context.packageJson?.dependencies?.['sequelize']
    )
      features.push('orm');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');
    if (
      context.packageJson?.dependencies?.['jsonwebtoken'] ||
      context.packageJson?.dependencies?.['passport']
    )
      features.push('auth');

    if (!context.packageJson?.scripts?.['start']) {
      warnings.push(
        'No start script found in package.json — ensure the container entry point is configured',
      );
    }

    const expressVersion = context.packageJson?.dependencies?.['express'] ?? '';
    const version = this.extractVersion(expressVersion);

    return {
      framework: FrameworkType.EXPRESS,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
      buildMode: BuildMode.PRODUCTION,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', '.env.template'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 3000;
    const nodeVersion = detectionResult.nodeVersion ?? '20';
    const majorNode = nodeVersion.split('.')[0];
    const installCmd = this.getInstallCommand(context.packageManager);
    const entryPoint = context.packageJson?.main ?? 'index.js';

    const hasTypeScript = detectionResult.features?.includes('typescript');
    const dockerfile = hasTypeScript
      ? `FROM node:${majorNode}-alpine AS builder
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd}
COPY . .
RUN npm run build

FROM node:${majorNode}-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd} --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE ${port}
CMD ["node", "dist/${entryPoint.replace('.ts', '.js')}"]
`
      : `FROM node:${majorNode}-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd} --omit=dev
COPY . .
EXPOSE ${port}
CMD ["node", "${entryPoint}"]
`;

    return {
      framework: FrameworkType.EXPRESS,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.PRODUCTION,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '100m', limit: '500m' },
        memory: { request: '128Mi', limit: '256Mi' },
      },
      healthCheck: {
        enabled: true,
        path: '/health',
        port,
        initialDelaySeconds: 10,
        periodSeconds: 10,
        timeoutSeconds: 5,
        successThreshold: 1,
        failureThreshold: 3,
      },
      networking: { port, protocol: 'http', ingressEnabled: true },
      scaling: {
        enabled: true,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilization: 70,
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'express-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      ...(() => {
        const scripts = context.packageJson?.scripts ?? {};
        const hasStartScript = !!scripts.start;
        const mainFile = context.packageJson?.main ?? 'index.js';
        const projectWarnings = [...(detectionResult.warnings ?? [])];
        const userChoicesRequired = [];
        if (!hasStartScript) {
          projectWarnings.push('No start script in package.json');
          userChoicesRequired.push({
            field: 'startCommand' as const,
            description: 'No start script found — specify the start command',
            options: [
              { label: `node ${mainFile}`, value: `node ${mainFile}` },
              { label: 'node server.js', value: 'node server.js' },
              { label: 'node app.js', value: 'node app.js' },
            ],
            suggestedIndex: 0,
          });
        }
        const strategy = hasStartScript
          ? DeployStrategy.RAILPACK_WITH_OVERRIDES
          : DeployStrategy.NEEDS_ADJUSTMENT;
        const score = hasStartScript ? 0.75 : 0.3;
        return {
          deployStrategy: strategy,
          deployabilityScore: score,
          deployabilityFactors: {
            frameworkRecognized: true,
            repoClarity: hasStartScript ? 0.8 : 0.3,
            artifactPredictability: 0.7,
            runtimePredictability: hasStartScript ? 0.8 : 0.2,
            buildReproducibility: context.lockfilePresent ? 0.85 : 0.6,
          },
          suggestedStartCommand: hasStartScript ? scripts.start : undefined,
          projectWarnings,
          recommendedStructure: hasStartScript
            ? undefined
            : ['Add "scripts": { "start": "node index.js" } to package.json'],
          requiresUserConfirmation: !hasStartScript || score < 0.82,
          userChoicesRequired,
        };
      })(),
    };
  }

  private getInstallCommand(pm?: string): string {
    const map: Record<string, string> = {
      pnpm: 'pnpm install --frozen-lockfile',
      yarn: 'yarn install --frozen-lockfile',
      bun: 'bun install --frozen-lockfile',
    };
    return map[pm ?? ''] ?? 'npm ci';
  }

  private getLockfileCopy(pm?: string): string {
    const map: Record<string, string> = {
      pnpm: 'COPY pnpm-lock.yaml ./',
      yarn: 'COPY yarn.lock ./',
      bun: 'COPY bun.lockb ./',
    };
    return map[pm ?? ''] ?? 'COPY package-lock.json ./';
  }

  private extractVersion(raw: string): string {
    const match = /\d+\.\d+\.\d+/.exec(raw);
    return match ? match[0] : raw.replaceAll(/[^0-9.]/g, '') || 'unknown';
  }

  private extractMajorVersion(version: string): string {
    return version.split('.')[0] ?? 'unknown';
  }
}
