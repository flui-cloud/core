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
 * Catch-all for Node.js projects that don't match any specific framework.
 * Priority 30 — always loses to specific detectors.
 */
@Injectable()
export class GenericNodeDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(GenericNodeDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.GENERIC_NODE,
      displayName: 'Node.js (Generic)',
      detectorName: 'generic-node-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['18.x', '20.x', '22.x'],
      priority: 30,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return context.rootFiles.includes('package.json');
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Generic Node detector: starting detection');

    const features: string[] = [];
    const warnings: string[] = [];

    if (context.packageJson?.scripts?.start) features.push('start-script');
    if (context.packageJson?.main) features.push('main-entry');
    if (context.packageJson?.type === 'module') features.push('esm');
    if (context.packageJson?.devDependencies?.typescript)
      features.push('typescript');
    if (!context.lockfilePresent)
      warnings.push('No lockfile found — add one for reproducible builds');
    if (!context.packageJson?.scripts?.start)
      warnings.push(
        'No start script found in package.json — add one or specify the entry point',
      );

    const nodeVersion = context.nodeVersion ?? '20';

    return {
      framework: FrameworkType.GENERIC_NODE,
      confidence: 30,
      version: context.packageJson?.engines?.node ?? nodeVersion,
      majorVersion: nodeVersion.split('.')[0],
      buildMode: BuildMode.PRODUCTION,
      features,
      packageManager: context.packageManager,
      nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { main: context.packageJson?.main ?? 'index.js' },
    };
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 3000;
    const nodeVersion = detectionResult.nodeVersion ?? '20';
    const majorNode = nodeVersion.split('.')[0];
    const installCmd = this.getInstallCommand(context.packageManager);
    const main = (detectionResult.metadata?.main as string) ?? 'index.js';
    const hasTs = detectionResult.features?.includes('typescript');

    const dockerfile = hasTs
      ? `FROM node:${majorNode}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN ${installCmd}
COPY . .
RUN npm run build

FROM node:${majorNode}-alpine
ENV NODE_ENV=production
ENV PORT=${port}
WORKDIR /app
COPY package*.json ./
RUN ${installCmd} --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE ${port}
CMD ["node", "dist/main.js"]
`
      : `FROM node:${majorNode}-alpine
ENV NODE_ENV=production
ENV PORT=${port}
WORKDIR /app
COPY package*.json ./
RUN ${installCmd} --omit=dev
COPY . .
EXPOSE ${port}
CMD ["node", "${main}"]
`;

    return {
      framework: FrameworkType.GENERIC_NODE,
      version: detectionResult.version ?? nodeVersion,
      buildMode: BuildMode.PRODUCTION,
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
        enabled: false,
        minReplicas: 1,
        maxReplicas: 3,
        targetCPUUtilization: 70,
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'generic-node-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: context.packageJson?.scripts?.start
        ? DeployStrategy.RAILPACK_WITH_OVERRIDES
        : DeployStrategy.NEEDS_ADJUSTMENT,
      deployabilityScore: context.packageJson?.scripts?.start ? 0.65 : 0.25,
      deployabilityFactors: {
        frameworkRecognized: false,
        repoClarity: context.packageJson?.scripts?.start ? 0.65 : 0.25,
        artifactPredictability: 0.6,
        runtimePredictability: context.packageJson?.scripts?.start ? 0.7 : 0.2,
        buildReproducibility: context.lockfilePresent ? 0.7 : 0.45,
      },
      suggestedStartCommand: context.packageJson?.scripts?.start,
      projectWarnings: [
        ...(detectionResult.warnings ?? []),
        ...(context.packageJson?.scripts?.start
          ? []
          : ['No start script found in package.json']),
      ],
      recommendedStructure: context.packageJson?.scripts?.start
        ? undefined
        : ['Add "scripts": { "start": "node <entrypoint>" } to package.json'],
      requiresUserConfirmation: true,
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
}
