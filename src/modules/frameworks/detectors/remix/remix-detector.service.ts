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
export class RemixDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(RemixDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.REMIX,
      displayName: 'Remix',
      detectorName: 'remix-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['1.x', '2.x'],
      priority: 76,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('remix.config.js') ||
      context.rootFiles.includes('remix.config.ts') ||
      !!context.packageJson?.dependencies?.['@remix-run/node'] ||
      !!context.packageJson?.dependencies?.['@remix-run/react'] ||
      !!context.packageJson?.devDependencies?.['@remix-run/dev']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Remix detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasConfig =
      context.rootFiles.includes('remix.config.js') ||
      context.rootFiles.includes('remix.config.ts');
    if (hasConfig) confidence += 45;

    const remixNode = context.packageJson?.dependencies?.['@remix-run/node'];
    const remixReact = context.packageJson?.dependencies?.['@remix-run/react'];
    const remixDev = context.packageJson?.devDependencies?.['@remix-run/dev'];
    if (remixNode) confidence += 25;
    if (remixReact) confidence += 20;
    if (remixDev) confidence += 10;

    if (context.files.some((f) => f.startsWith('app/routes/')))
      features.push('file-routing');
    if (context.packageJson?.dependencies?.['react']) features.push('react');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');
    if (
      context.packageJson?.dependencies?.['tailwindcss'] ||
      context.packageJson?.devDependencies?.['tailwindcss']
    )
      features.push('tailwind');
    if (
      context.packageJson?.dependencies?.['@prisma/client'] ||
      context.packageJson?.devDependencies?.['prisma']
    )
      features.push('prisma');

    const version = this.extractVersion(
      remixNode ?? remixReact ?? remixDev ?? '',
    );

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    return {
      framework: FrameworkType.REMIX,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
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
COPY --from=builder /app/public ./public
EXPOSE ${port}
CMD ["npm", "start"]
`;

    return {
      framework: FrameworkType.REMIX,
      version: detectionResult.version ?? 'unknown',
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
        templateVersion: 'remix-1.0',
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
