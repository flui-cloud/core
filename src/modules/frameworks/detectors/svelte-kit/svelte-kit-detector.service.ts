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
export class SvelteKitDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(SvelteKitDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.SVELTE_KIT,
      displayName: 'SvelteKit',
      detectorName: 'svelte-kit-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['1.x', '2.x'],
      priority: 73,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('svelte.config.js') ||
      context.rootFiles.includes('svelte.config.ts') ||
      !!context.packageJson?.devDependencies?.['@sveltejs/kit'] ||
      !!context.packageJson?.dependencies?.['@sveltejs/kit']
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('SvelteKit detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasConfig =
      context.rootFiles.includes('svelte.config.js') ||
      context.rootFiles.includes('svelte.config.ts');
    if (hasConfig) confidence += 45;

    const kitVersion =
      context.packageJson?.devDependencies?.['@sveltejs/kit'] ??
      context.packageJson?.dependencies?.['@sveltejs/kit'];
    if (kitVersion) confidence += 40;

    const svelteVersion =
      context.packageJson?.devDependencies?.['svelte'] ??
      context.packageJson?.dependencies?.['svelte'];
    if (svelteVersion) confidence += 15;

    if (context.files.some((f) => f.startsWith('src/routes/')))
      features.push('file-routing');
    if (
      context.files.some(
        (f) => f.includes('+server.ts') || f.includes('+server.js'),
      )
    )
      features.push('api-routes');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');
    if (
      context.packageJson?.devDependencies?.['tailwindcss'] ||
      context.packageJson?.dependencies?.['tailwindcss']
    )
      features.push('tailwind');
    if (
      context.packageJson?.dependencies?.['pocketbase'] ||
      context.packageJson?.dependencies?.['@supabase/supabase-js']
    )
      features.push('backend-integration');

    // Detect adapter
    const deps = {
      ...context.packageJson?.devDependencies,
      ...context.packageJson?.dependencies,
    };
    if (deps?.['@sveltejs/adapter-node']) features.push('adapter-node');
    else if (deps?.['@sveltejs/adapter-static'])
      features.push('adapter-static');
    else if (deps?.['@sveltejs/adapter-auto']) features.push('adapter-auto');

    const isStatic = features.includes('adapter-static');
    const buildMode = isStatic ? BuildMode.STATIC : BuildMode.SSR;

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    const version = this.extractVersion(kitVersion ?? svelteVersion ?? '');

    return {
      framework: FrameworkType.SVELTE_KIT,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
      buildMode,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {
        hasConfig,
        adapter:
          features.find((f) => f.startsWith('adapter-')) ?? 'adapter-auto',
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
    const port = context.fluiConfig?.runtime?.port ?? 3000;
    const nodeVersion = detectionResult.nodeVersion ?? '20';
    const majorNode = nodeVersion.split('.')[0];
    const installCmd = this.getInstallCommand(context.packageManager);
    const isStatic = detectionResult.features?.includes('adapter-static');

    const dockerfile = isStatic
      ? `FROM node:${majorNode}-alpine AS builder
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd}
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`
      : `FROM node:${majorNode}-alpine AS builder
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
COPY --from=builder /app/build ./build
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd} --omit=dev
EXPOSE ${port}
CMD ["node", "build/index.js"]
`;

    const effectivePort = isStatic ? 80 : port;

    return {
      framework: FrameworkType.SVELTE_KIT,
      version: detectionResult.version ?? 'unknown',
      buildMode: detectionResult.buildMode ?? BuildMode.SSR,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '100m', limit: '300m' },
        memory: { request: '128Mi', limit: '256Mi' },
      },
      healthCheck: {
        enabled: true,
        path: '/',
        port: effectivePort,
        initialDelaySeconds: 10,
        periodSeconds: 10,
        timeoutSeconds: 5,
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
        templateVersion: 'svelte-kit-1.0',
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
    const match = /\d+\.\d+\.\d+/.exec(raw);
    return match ? match[0] : raw.replaceAll(/[^0-9.]/g, '') || 'unknown';
  }

  private extractMajorVersion(version: string): string {
    return version.split('.')[0] ?? 'unknown';
  }
}
