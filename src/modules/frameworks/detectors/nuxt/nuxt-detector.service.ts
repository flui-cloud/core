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
export class NuxtDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(NuxtDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.NUXT,
      displayName: 'Nuxt',
      detectorName: 'nuxt-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['3.x'],
      priority: 74,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('nuxt.config.ts') ||
      context.rootFiles.includes('nuxt.config.js') ||
      !!context.packageJson?.dependencies?.['nuxt'] ||
      !!context.packageJson?.devDependencies?.['nuxt']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Nuxt detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasConfig =
      context.rootFiles.includes('nuxt.config.ts') ||
      context.rootFiles.includes('nuxt.config.js');
    if (hasConfig) confidence += 50;

    const nuxtVersion =
      context.packageJson?.dependencies?.['nuxt'] ??
      context.packageJson?.devDependencies?.['nuxt'];
    if (nuxtVersion) confidence += 40;

    if (context.files.some((f) => f.startsWith('pages/'))) {
      confidence += 10;
      features.push('pages-router');
    }
    if (context.files.some((f) => f.startsWith('server/')))
      features.push('server-api');
    if (context.files.some((f) => f.startsWith('components/')))
      features.push('components');
    if (
      context.packageJson?.dependencies?.['@pinia/nuxt'] ||
      context.packageJson?.dependencies?.['pinia']
    )
      features.push('pinia');
    if (
      context.packageJson?.devDependencies?.['@nuxtjs/tailwindcss'] ||
      context.packageJson?.devDependencies?.['tailwindcss']
    )
      features.push('tailwind');

    // Detect build mode: if ssr: false in config, it's SPA
    const hasServerDir = context.files.some((f) => f.startsWith('server/'));
    const buildMode = hasServerDir ? BuildMode.SSR : BuildMode.PRODUCTION;

    const version = this.extractVersion(nuxtVersion ?? '');

    return {
      framework: FrameworkType.NUXT,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
      buildMode,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasConfig },
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
ENV NUXT_HOST=0.0.0.0
ENV PORT=${port}
WORKDIR /app
COPY --from=builder /app/.output ./.output
EXPOSE ${port}
CMD ["node", ".output/server/index.mjs"]
`;

    return {
      framework: FrameworkType.NUXT,
      version: detectionResult.version ?? 'unknown',
      buildMode: detectionResult.buildMode ?? BuildMode.SSR,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '250m', limit: '500m' },
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
        templateVersion: 'nuxt-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: 0.9,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.9,
        artifactPredictability: 0.9,
        runtimePredictability: 0.92,
        buildReproducibility: context.lockfilePresent ? 0.92 : 0.72,
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
    const match = /\d+\.\d+\.\d+/.exec(raw);
    return match ? match[0] : raw.replaceAll(/[^0-9.]/g, '') || 'unknown';
  }

  private extractMajorVersion(version: string): string {
    return version.split('.')[0] ?? 'unknown';
  }
}
