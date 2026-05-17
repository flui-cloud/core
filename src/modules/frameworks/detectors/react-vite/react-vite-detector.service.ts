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
export class ReactViteDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(ReactViteDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.REACT_VITE,
      displayName: 'React (Vite)',
      detectorName: 'react-vite-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['18.x', '19.x'],
      priority: 72,
      category: 'frontend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    const hasViteConfig =
      context.rootFiles.includes('vite.config.ts') ||
      context.rootFiles.includes('vite.config.js') ||
      context.rootFiles.includes('vite.config.mjs');

    const hasReact =
      !!context.packageJson?.dependencies?.['react'] ||
      !!context.packageJson?.devDependencies?.['react'];

    const hasViteReactPlugin =
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-react'] ||
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-react-swc'];

    return (hasViteConfig && hasReact) || hasViteReactPlugin;
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('React Vite detector: starting detection');

    let confidence = 0;
    const warnings: string[] = [];
    const features: string[] = [];

    const hasViteConfig =
      context.rootFiles.includes('vite.config.ts') ||
      context.rootFiles.includes('vite.config.js') ||
      context.rootFiles.includes('vite.config.mjs');

    if (hasViteConfig) confidence += 40;

    const hasReactPlugin =
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-react'] ||
      !!context.packageJson?.devDependencies?.['@vitejs/plugin-react-swc'];
    if (hasReactPlugin) confidence += 35;

    const reactVersion = context.packageJson?.dependencies?.['react'];
    if (reactVersion) {
      confidence += 25;
      if (context.packageJson?.devDependencies?.['@vitejs/plugin-react-swc']) {
        features.push('swc');
      }
    }

    if (context.packageJson?.dependencies?.['react-router-dom'])
      features.push('react-router');
    if (context.packageJson?.dependencies?.['@tanstack/react-query'])
      features.push('react-query');
    if (
      context.packageJson?.dependencies?.['zustand'] ||
      context.packageJson?.dependencies?.['jotai']
    )
      features.push('state-management');
    if (
      context.packageJson?.dependencies?.['tailwindcss'] ||
      context.packageJson?.devDependencies?.['tailwindcss']
    )
      features.push('tailwind');
    if (context.packageJson?.devDependencies?.['typescript'])
      features.push('typescript');

    if (!context.packageJson?.scripts?.['build']) {
      warnings.push('No build script found in package.json');
    }

    const version = this.extractVersion(reactVersion ?? '');
    const nodeVersion = this.detectNodeVersion(context);

    return {
      framework: FrameworkType.REACT_VITE,
      confidence,
      version,
      majorVersion: this.extractMajorVersion(version),
      buildMode: BuildMode.SPA,
      features,
      packageManager: context.packageManager,
      nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasViteConfig, hasReactPlugin },
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
    const nodeVersion =
      detectionResult.nodeVersion ?? context.nodeVersion ?? '20';
    const majorNode = nodeVersion.split('.')[0];

    const dockerfile = this.generateSPADockerfile(majorNode, context);

    return {
      framework: FrameworkType.REACT_VITE,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.SPA,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: {
          request: context.fluiConfig?.resources?.cpu?.request ?? '100m',
          limit: context.fluiConfig?.resources?.cpu?.limit ?? '200m',
        },
        memory: {
          request: context.fluiConfig?.resources?.memory?.request ?? '64Mi',
          limit: context.fluiConfig?.resources?.memory?.limit ?? '128Mi',
        },
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
        templateVersion: 'react-vite-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: context.packageJson?.scripts?.build
        ? DeployStrategy.RAILPACK_DIRECT
        : DeployStrategy.RAILPACK_WITH_OVERRIDES,
      deployabilityScore:
        context.packageJson?.scripts?.build && context.lockfilePresent
          ? 0.88
          : 0.72,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.9,
        artifactPredictability: 0.9,
        runtimePredictability: 0.95,
        buildReproducibility: context.lockfilePresent ? 0.9 : 0.7,
      },
      suggestedBuildCommand: context.packageJson?.scripts?.build
        ? undefined
        : 'npm run build',
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
    };
  }

  private generateSPADockerfile(
    nodeVersion: string,
    context: IDetectionContext,
  ): string {
    const installCmd = this.getInstallCommand(context.packageManager);
    return `FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY package*.json ./
${this.getLockfileCopy(context.packageManager)}
RUN ${installCmd}
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
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

  private detectNodeVersion(context: IDetectionContext): string | undefined {
    if (context.nodeVersion) return context.nodeVersion;
    const engines = context.packageJson?.engines?.node;
    if (engines) return engines.replaceAll(/[^0-9.]/g, '').split('.')[0];
    return undefined;
  }
}
