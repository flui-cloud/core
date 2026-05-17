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
export class VueViteDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(VueViteDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.VUE_VITE,
      displayName: 'Vue (Vite)',
      detectorName: 'vue-vite-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['3.x'],
      priority: 70,
      category: 'frontend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    const hasViteConfig =
      context.rootFiles.includes('vite.config.ts') ||
      context.rootFiles.includes('vite.config.js') ||
      context.rootFiles.includes('vite.config.mjs');

    const hasVue =
      !!context.packageJson?.dependencies?.['vue'] ||
      !!context.packageJson?.devDependencies?.['vue'];

    const hasViteVuePlugin =
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-vue'] ||
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-vue-jsx'];

    return (hasViteConfig && hasVue) || hasViteVuePlugin;
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Vue Vite detector: starting detection');

    let confidence = 0;
    const warnings: string[] = [];
    const features: string[] = [];

    const hasViteConfig =
      context.rootFiles.includes('vite.config.ts') ||
      context.rootFiles.includes('vite.config.js') ||
      context.rootFiles.includes('vite.config.mjs');

    if (hasViteConfig) confidence += 40;

    const hasViteVuePlugin =
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-vue'] ||
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-vue-jsx'];
    if (hasViteVuePlugin) confidence += 35;

    const vueVersion = context.packageJson?.dependencies?.['vue'];
    if (vueVersion) confidence += 25;

    if (context.packageJson?.dependencies?.['vue-router'])
      features.push('vue-router');
    if (context.packageJson?.dependencies?.['pinia']) features.push('pinia');
    if (context.packageJson?.dependencies?.['vuex']) features.push('vuex');
    if (context.packageJson?.devDependencies?.['@vitejs/plugin-vue-jsx'])
      features.push('jsx');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');
    if (
      context.packageJson?.dependencies?.['tailwindcss'] ||
      context.packageJson?.devDependencies?.['tailwindcss']
    )
      features.push('tailwind');

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    const version = this.extractVersion(vueVersion ?? '');

    return {
      framework: FrameworkType.VUE_VITE,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
      buildMode: BuildMode.SPA,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasViteConfig, hasViteVuePlugin },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 80;
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

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

    return {
      framework: FrameworkType.VUE_VITE,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.SPA,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '100m', limit: '200m' },
        memory: { request: '64Mi', limit: '128Mi' },
      },
      healthCheck: {
        enabled: true,
        path: '/',
        port,
        initialDelaySeconds: 5,
        periodSeconds: 10,
        timeoutSeconds: 3,
        successThreshold: 1,
        failureThreshold: 3,
      },
      networking: { port, protocol: 'http', ingressEnabled: true },
      scaling: {
        enabled: false,
        minReplicas: 1,
        maxReplicas: 3,
        targetCPUUtilization: 70,
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'vue-vite-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: context.lockfilePresent ? 0.88 : 0.72,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.9,
        artifactPredictability: 0.9,
        runtimePredictability: 0.95,
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
