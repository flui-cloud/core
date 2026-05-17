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
export class LaravelDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(LaravelDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.LARAVEL,
      displayName: 'Laravel',
      detectorName: 'laravel-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['9.x', '10.x', '11.x'],
      priority: 61,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // `artisan` file is the definitive Laravel signal (as per Railpack)
    return context.rootFiles.includes('artisan');
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Laravel detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    // artisan is the strongest signal
    if (context.rootFiles.includes('artisan')) confidence += 70;
    if (context.rootFiles.includes('composer.json')) {
      confidence += 15;
      features.push('composer');
    }
    if (context.rootFiles.includes('composer.lock')) {
      confidence += 10;
      features.push('composer-lock');
    }
    if (context.files.includes('bootstrap/app.php')) confidence += 5;

    // Laravel structure signals
    if (context.files.some((f) => f.startsWith('app/Http/Controllers/')))
      features.push('mvc');
    if (context.files.some((f) => f.startsWith('app/Models/')))
      features.push('eloquent');
    if (context.files.some((f) => f.startsWith('database/migrations/')))
      features.push('migrations');
    if (context.files.some((f) => f.startsWith('routes/api.php')))
      features.push('api-routes');
    if (context.files.some((f) => f.startsWith('routes/web.php')))
      features.push('web-routes');
    if (context.files.some((f) => f.startsWith('resources/views/')))
      features.push('blade-templates');
    if (context.files.some((f) => f.startsWith('app/Jobs/')))
      features.push('queues');
    if (context.files.some((f) => f.startsWith('app/Events/')))
      features.push('events');
    if (
      context.rootFiles.includes('vite.config.js') ||
      context.rootFiles.includes('vite.config.ts')
    )
      features.push('vite');

    if (!context.rootFiles.includes('composer.lock')) {
      warnings.push('No composer.lock found — add one for reproducible builds');
    }

    return {
      framework: FrameworkType.LARAVEL,
      confidence: Math.min(confidence, 100),
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasVite: features.includes('vite') },
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
    const hasVite = detectionResult.features?.includes('vite');

    const nodeStep = hasVite
      ? `RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build`
      : 'COPY . .';

    const dockerfile = String.raw`FROM php:8.3-fpm-alpine AS builder
RUN apk add --no-cache \\
    nginx \\
    supervisor \\
    curl \\
    libpng-dev \\
    libzip-dev \\
    zip \\
    unzip \\
    && docker-php-ext-install pdo pdo_mysql zip gd opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
${nodeStep}
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache 2>/dev/null || true
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
EXPOSE ${port}
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
`;

    return {
      framework: FrameworkType.LARAVEL,
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
        initialDelaySeconds: 20,
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
        templateVersion: 'laravel-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_WITH_OVERRIDES,
      deployabilityScore: 0.68,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.8,
        artifactPredictability: 0.7,
        runtimePredictability: 0.75,
        buildReproducibility: 0.7,
      },
      suggestedBuildCommand: 'composer install --no-dev --optimize-autoloader',
      suggestedStartCommand: 'php artisan serve --host=0.0.0.0 --port=8000',
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: true,
      userChoicesRequired: [],
    };
  }
}
