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
export class AstroDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(AstroDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.ASTRO,
      displayName: 'Astro',
      detectorName: 'astro-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['2.x', '3.x', '4.x'],
      priority: 71,
      category: 'frontend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('astro.config.mjs') ||
      context.rootFiles.includes('astro.config.ts') ||
      context.rootFiles.includes('astro.config.js') ||
      !!context.packageJson?.dependencies?.['astro'] ||
      !!context.packageJson?.devDependencies?.['astro']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Astro detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasConfig =
      context.rootFiles.includes('astro.config.mjs') ||
      context.rootFiles.includes('astro.config.ts') ||
      context.rootFiles.includes('astro.config.js');
    if (hasConfig) confidence += 50;

    const astroVersion =
      context.packageJson?.dependencies?.['astro'] ??
      context.packageJson?.devDependencies?.['astro'];
    if (astroVersion) confidence += 40;

    if (context.files.some((f) => f.startsWith('src/pages/'))) {
      confidence += 10;
      features.push('pages');
    }

    // Detect integrations
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };
    if (deps?.['@astrojs/react']) features.push('react');
    if (deps?.['@astrojs/vue']) features.push('vue');
    if (deps?.['@astrojs/svelte']) features.push('svelte');
    if (deps?.['@astrojs/tailwind'] || deps?.['tailwindcss'])
      features.push('tailwind');
    if (deps?.['@astrojs/mdx']) features.push('mdx');
    if (deps?.['@astrojs/node']) features.push('adapter-node');
    if (deps?.['@astrojs/vercel']) features.push('adapter-vercel');

    const isSSR = features.includes('adapter-node');
    const buildMode = isSSR ? BuildMode.SSR : BuildMode.STATIC;

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    const version = this.extractVersion(astroVersion ?? '');

    return {
      framework: FrameworkType.ASTRO,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
      buildMode,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasConfig, isSSR },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 4321;
    const nodeVersion = detectionResult.nodeVersion ?? '20';
    const majorNode = nodeVersion.split('.')[0];
    const installCmd = this.getInstallCommand(context.packageManager);
    const isSSR = detectionResult.features?.includes('adapter-node');

    const dockerfile = isSSR
      ? `FROM node:${majorNode}-alpine AS builder
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd}
COPY . .
RUN npm run build

FROM node:${majorNode}-alpine
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=${port}
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE ${port}
CMD ["node", "./dist/server/entry.mjs"]
`
      : `FROM node:${majorNode}-alpine AS builder
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd}
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

    const effectivePort = isSSR ? port : 80;

    return {
      framework: FrameworkType.ASTRO,
      version: detectionResult.version ?? 'unknown',
      buildMode: detectionResult.buildMode ?? BuildMode.STATIC,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '100m', limit: '200m' },
        memory: { request: '128Mi', limit: '256Mi' },
      },
      healthCheck: {
        enabled: true,
        path: '/',
        port: effectivePort,
        initialDelaySeconds: 5,
        periodSeconds: 10,
        timeoutSeconds: 3,
        successThreshold: 1,
        failureThreshold: 3,
      },
      networking: {
        port: effectivePort,
        protocol: 'http',
        ingressEnabled: true,
      },
      scaling: {
        enabled: false,
        minReplicas: 1,
        maxReplicas: 3,
        targetCPUUtilization: 70,
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'astro-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: 0.88,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.9,
        artifactPredictability: 0.9,
        runtimePredictability: 0.9,
        buildReproducibility: 0.9,
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
