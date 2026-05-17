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

/**
 * React Router v7 detector.
 * React Router v7 is essentially Remix rebranded — it uses react-router.config.ts
 * and @react-router/dev instead of remix.config.js and @remix-run/dev.
 */
@Injectable()
export class ReactRouterDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(ReactRouterDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.REACT_ROUTER,
      displayName: 'React Router v7',
      detectorName: 'react-router-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['7.x'],
      priority: 77,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('react-router.config.ts') ||
      context.rootFiles.includes('react-router.config.js') ||
      !!context.packageJson?.devDependencies?.['@react-router/dev'] ||
      (!!context.packageJson?.dependencies?.['react-router'] &&
        this.isV7OrAbove(context.packageJson?.dependencies?.['react-router']))
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('React Router v7 detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasConfig =
      context.rootFiles.includes('react-router.config.ts') ||
      context.rootFiles.includes('react-router.config.js');
    if (hasConfig) confidence += 50;

    const hasDevPkg =
      !!context.packageJson?.devDependencies?.['@react-router/dev'];
    if (hasDevPkg) confidence += 30;

    const rrVersion = context.packageJson?.dependencies?.['react-router'];
    if (rrVersion && this.isV7OrAbove(rrVersion)) confidence += 20;

    if (context.files.some((f) => f.startsWith('app/routes/')))
      features.push('file-routing');
    if (context.files.some((f) => f.includes('+') && f.endsWith('.tsx')))
      features.push('route-convention');
    if (context.packageJson?.dependencies?.['react']) features.push('react');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');
    if (
      context.packageJson?.devDependencies?.['tailwindcss'] ||
      context.packageJson?.dependencies?.['tailwindcss']
    )
      features.push('tailwind');

    const version = this.extractVersion(rrVersion ?? '');

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    return {
      framework: FrameworkType.REACT_ROUTER,
      confidence,
      version,
      majorVersion: '7',
      buildMode: BuildMode.SSR,
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
ENV PORT=${port}
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd} --omit=dev
COPY --from=builder /app/build ./build
EXPOSE ${port}
CMD ["npm", "start"]
`;

    return {
      framework: FrameworkType.REACT_ROUTER,
      version: detectionResult.version ?? '7',
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
        templateVersion: 'react-router-7-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: 0.88,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.9,
        artifactPredictability: 0.88,
        runtimePredictability: 0.9,
        buildReproducibility: context.lockfilePresent ? 0.9 : 0.7,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
    };
  }

  private isV7OrAbove(version: string): boolean {
    const major = Number.parseInt(version.replace(/\D/, ''), 10);
    return !Number.isNaN(major) && major >= 7;
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
    return match ? match[0] : raw.replaceAll(/[^0-9.]/g, '') || '7';
  }
}
