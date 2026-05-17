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
export class RailsDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(RailsDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.RAILS,
      displayName: 'Ruby on Rails',
      detectorName: 'rails-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['6.x', '7.x', '8.x'],
      priority: 64,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('Gemfile') &&
      (context.files.includes('config/application.rb') ||
        context.files.includes('bin/rails'))
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Rails detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('Gemfile')) confidence += 20;
    if (context.files.includes('config/application.rb')) confidence += 45;
    if (context.files.includes('config/routes.rb')) confidence += 20;
    if (context.files.includes('bin/rails')) confidence += 15;

    // Rails structure signals
    if (context.files.some((f) => f.startsWith('app/controllers/')))
      features.push('mvc');
    if (context.files.some((f) => f.startsWith('app/models/')))
      features.push('active-record');
    if (context.files.some((f) => f.startsWith('app/views/')))
      features.push('erb-views');
    if (context.files.some((f) => f.startsWith('db/migrate/')))
      features.push('migrations');
    if (context.files.some((f) => f.startsWith('app/jobs/')))
      features.push('active-job');
    if (context.files.some((f) => f.startsWith('app/channels/')))
      features.push('action-cable');
    if (context.files.some((f) => f.startsWith('app/javascript/')))
      features.push('js-assets');
    if (context.rootFiles.includes('Gemfile.lock'))
      features.push('gemfile-lock');

    // API-only detection
    if (!context.files.some((f) => f.startsWith('app/views/')))
      features.push('api-only');

    if (!context.rootFiles.includes('Gemfile.lock')) {
      warnings.push('No Gemfile.lock found — add one for reproducible builds');
    }

    return {
      framework: FrameworkType.RAILS,
      confidence: Math.min(confidence, 100),
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { isApiOnly: features.includes('api-only') },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', 'config/database.yml'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 3000;
    const isApiOnly = detectionResult.metadata?.isApiOnly as boolean;

    const assetsStep = isApiOnly
      ? ''
      : 'RUN bundle exec rails assets:precompile RAILS_ENV=production SECRET_KEY_BASE=placeholder 2>/dev/null || true';

    const dockerfile = String.raw`FROM ruby:3.3-slim
RUN apt-get update -qq && apt-get install -y \\
    build-essential \\
    libpq-dev \\
    nodejs \\
    && rm -rf /var/lib/apt/lists/*
ENV RAILS_ENV=production
ENV PORT=${port}
WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test --jobs 4 --retry 3
COPY . .
${assetsStep}
RUN bundle exec rails db:migrate 2>/dev/null || true
EXPOSE ${port}
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "${port}"]
`;

    return {
      framework: FrameworkType.RAILS,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.PRODUCTION,
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
        path: '/up',
        port,
        initialDelaySeconds: 30,
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
        templateVersion: 'rails-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_WITH_OVERRIDES,
      deployabilityScore: detectionResult.features?.includes('gemfile-lock')
        ? 0.72
        : 0.62,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.8,
        artifactPredictability: 0.75,
        runtimePredictability: 0.8,
        buildReproducibility: detectionResult.features?.includes('gemfile-lock')
          ? 0.8
          : 0.55,
      },
      suggestedBuildCommand: 'bundle install',
      suggestedStartCommand: 'bundle exec rails server -b 0.0.0.0 -p 3000',
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: true,
      userChoicesRequired: [],
    };
  }
}
