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
export class PhoenixDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(PhoenixDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.PHOENIX,
      displayName: 'Phoenix (Elixir)',
      detectorName: 'phoenix-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['1.6.x', '1.7.x'],
      priority: 58,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // mix.exs is the definitive Elixir signal (as per Railpack)
    return context.rootFiles.includes('mix.exs');
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Phoenix detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('mix.exs')) confidence += 60;
    if (context.rootFiles.includes('mix.lock')) {
      confidence += 15;
      features.push('mix-lock');
    }
    if (context.files.includes('config/config.exs')) confidence += 10;
    if (context.files.includes('config/runtime.exs')) {
      confidence += 10;
      features.push('runtime-config');
    }

    // Phoenix-specific signals
    if (
      context.files.some((f) => f.includes('_web/') || f.includes('_web.ex'))
    ) {
      confidence += 5;
      features.push('phoenix-web');
    }
    if (
      context.files.some((f) => f.startsWith('lib/') && f.endsWith('_web.ex'))
    )
      features.push('umbrella-app');
    if (context.files.some((f) => f.startsWith('priv/repo/migrations/')))
      features.push('ecto-migrations');
    if (context.files.some((f) => f.includes('live') || f.endsWith('_live.ex')))
      features.push('liveview');
    if (context.files.some((f) => f.startsWith('assets/')))
      features.push('assets');
    if (context.files.some((f) => f.endsWith('_channel.ex')))
      features.push('channels');
    if (context.files.some((f) => f.startsWith('test/')))
      features.push('tests');

    if (!context.rootFiles.includes('mix.lock')) {
      warnings.push('No mix.lock found — add one for reproducible builds');
    }

    return {
      framework: FrameworkType.PHOENIX,
      confidence: Math.min(confidence, 100),
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasLiveView: features.includes('liveview') },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', 'config/runtime.exs'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 4000;

    return {
      framework: FrameworkType.PHOENIX,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.PRODUCTION,
      dockerfile: '',
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '100m', limit: '500m' },
        memory: { request: '128Mi', limit: '256Mi' },
      },
      networking: { port, protocol: 'http', ingressEnabled: true },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'phoenix-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.NEEDS_ADJUSTMENT,
      deployabilityScore: 0,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.8,
        artifactPredictability: 0,
        runtimePredictability: 0,
        buildReproducibility: 0,
      },
      projectWarnings: [
        'Phoenix (Elixir) is not supported by Railpack. Automatic build is not available.',
      ],
      recommendedStructure: [
        'Add a Dockerfile starting with "# FLUI-BUILD" to the repository root to enable automatic builds.',
        'Alternatively, use the Docker Image flow to deploy a pre-built image from Docker Hub or GHCR.',
      ],
      requiresUserConfirmation: true,
      userChoicesRequired: [],
    };
  }
}
