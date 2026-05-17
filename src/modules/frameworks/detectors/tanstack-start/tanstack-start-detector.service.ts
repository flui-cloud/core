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
export class TanStackStartDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(TanStackStartDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.TANSTACK_START,
      displayName: 'TanStack Start',
      detectorName: 'tanstack-start-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['1.x'],
      priority: 68,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      !!context.packageJson?.dependencies?.['@tanstack/start'] ||
      !!context.packageJson?.devDependencies?.['@tanstack/start'] ||
      (context.rootFiles.includes('app.config.ts') &&
        !!context.packageJson?.dependencies?.['@tanstack/router'])
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('TanStack Start detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasPkg =
      !!context.packageJson?.dependencies?.['@tanstack/start'] ||
      !!context.packageJson?.devDependencies?.['@tanstack/start'];
    if (hasPkg) confidence += 60;

    if (context.rootFiles.includes('app.config.ts')) confidence += 25;
    if (context.packageJson?.dependencies?.['@tanstack/router']) {
      confidence += 15;
      features.push('tanstack-router');
    }
    if (context.packageJson?.dependencies?.['@tanstack/react-query'])
      features.push('react-query');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');
    if (
      context.packageJson?.devDependencies?.['tailwindcss'] ||
      context.packageJson?.dependencies?.['tailwindcss']
    )
      features.push('tailwind');
    if (context.files.some((f) => f.startsWith('app/routes/')))
      features.push('file-routing');

    const version =
      context.packageJson?.dependencies?.['@tanstack/start'] ??
      context.packageJson?.devDependencies?.['@tanstack/start'] ??
      '1';

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    return {
      framework: FrameworkType.TANSTACK_START,
      confidence,
      version: this.extractVersion(version),
      majorVersion: '1',
      buildMode: BuildMode.SSR,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {},
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 3000;
    const nodeVersion = detectionResult.nodeVersion ?? '20';
    const majorNode = nodeVersion.split('.')[0];
    const installCmd = this.getInstallCommand(context.packageManager);

    const dockerfile = `FROM node:${majorNode}-alpine AS builder
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd}
COPY . .
RUN npm run build

FROM node:${majorNode}-alpine
ENV NODE_ENV=production
ENV PORT=${port}
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd} --omit=dev
COPY --from=builder /app/.output ./.output
EXPOSE ${port}
CMD ["node", ".output/server/index.mjs"]
`;

    return {
      framework: FrameworkType.TANSTACK_START,
      version: detectionResult.version ?? '1',
      buildMode: BuildMode.SSR,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '200m', limit: '500m' },
        memory: { request: '256Mi', limit: '512Mi' },
      },
      healthCheck: {
        enabled: true,
        path: '/',
        port,
        initialDelaySeconds: 15,
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
        templateVersion: 'tanstack-start-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: 0.88,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.88,
        artifactPredictability: 0.88,
        runtimePredictability: 0.9,
        buildReproducibility: context.lockfilePresent ? 0.9 : 0.7,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
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
    const match = /\d+\.\d+/.exec(raw);
    return match ? match[0] : '1';
  }
}
