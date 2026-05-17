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
export class DjangoDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(DjangoDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.DJANGO,
      displayName: 'Django',
      detectorName: 'django-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['3.x', '4.x', '5.x'],
      priority: 65,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    const hasManage = context.rootFiles.includes('manage.py');
    const hasRequirements =
      context.rootFiles.includes('requirements.txt') ||
      context.rootFiles.includes('requirements.in') ||
      context.rootFiles.includes('Pipfile') ||
      context.rootFiles.includes('pyproject.toml');
    return (
      hasManage ||
      (hasRequirements && context.files.some((f) => f.endsWith('settings.py')))
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Django detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('manage.py')) confidence += 60;
    if (context.files.some((f) => f.endsWith('settings.py'))) confidence += 25;
    if (context.files.some((f) => f.endsWith('urls.py'))) confidence += 10;
    if (context.files.some((f) => f.endsWith('wsgi.py'))) {
      confidence += 5;
      features.push('wsgi');
    }
    if (context.files.some((f) => f.endsWith('asgi.py'))) features.push('asgi');
    if (context.rootFiles.includes('requirements.txt'))
      features.push('requirements-txt');
    if (context.rootFiles.includes('Pipfile')) features.push('pipenv');
    if (context.rootFiles.includes('pyproject.toml'))
      features.push('pyproject');
    if (context.files.some((f) => f.includes('celery')))
      features.push('celery');
    if (
      context.rootFiles.includes('Dockerfile') ||
      context.files.some((f) => f.includes('docker-compose'))
    )
      features.push('docker-ready');

    if (
      !context.rootFiles.includes('requirements.txt') &&
      !features.includes('pipenv') &&
      !features.includes('pyproject')
    ) {
      warnings.push(
        'No requirements.txt or Pipfile found — add one for reproducible builds',
      );
    }

    return {
      framework: FrameworkType.DJANGO,
      confidence,
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasManagePy: context.rootFiles.includes('manage.py') },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', '.env.template'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 8000;
    const hasAsgi = detectionResult.features?.includes('asgi');
    const hasPipfile = detectionResult.features?.includes('pipenv');
    const hasPyproject = detectionResult.features?.includes('pyproject');

    let installStep: string;
    if (hasPipfile) {
      installStep =
        'RUN pip install pipenv && pipenv install --deploy --system';
    } else if (hasPyproject) {
      installStep = 'RUN pip install .';
    } else {
      installStep = 'RUN pip install --no-cache-dir -r requirements.txt';
    }

    const serverCmd = hasAsgi
      ? `CMD ["uvicorn", "config.asgi:application", "--host", "0.0.0.0", "--port", "${port}"]`
      : `CMD ["gunicorn", "--bind", "0.0.0.0:${port}", "--workers", "4", "config.wsgi:application"]`;

    const extraDeps = hasAsgi
      ? 'RUN pip install uvicorn[standard]'
      : 'RUN pip install gunicorn';

    const dockerfile = `FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=${port}
WORKDIR /app
COPY requirements*.txt ./
${installStep}
${extraDeps}
COPY . .
RUN python manage.py collectstatic --noinput 2>/dev/null || true
EXPOSE ${port}
${serverCmd}
`;

    return {
      framework: FrameworkType.DJANGO,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.PRODUCTION,
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
        path: '/health/',
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
        templateVersion: 'django-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      ...(() => {
        const hasManagePy =
          detectionResult.features?.includes('manage-py') ||
          context.files.some((f) => f.endsWith('manage.py'));
        const hasRequirements =
          detectionResult.features?.some((f) =>
            ['requirements-txt', 'pyproject', 'pipenv'].includes(f),
          ) ?? false;
        const strategy =
          hasManagePy && hasRequirements
            ? DeployStrategy.RAILPACK_DIRECT
            : DeployStrategy.RAILPACK_WITH_OVERRIDES;
        const score = hasManagePy && hasRequirements ? 0.83 : 0.7;
        const warnings = [...(detectionResult.warnings ?? [])];
        if (!hasRequirements)
          warnings.push('No requirements.txt or pyproject.toml found');
        return {
          deployStrategy: strategy,
          deployabilityScore: score,
          deployabilityFactors: {
            frameworkRecognized: true,
            repoClarity: hasManagePy ? 0.9 : 0.6,
            artifactPredictability: 0.85,
            runtimePredictability: 0.85,
            buildReproducibility: hasRequirements ? 0.85 : 0.55,
          },
          projectWarnings: warnings,
          requiresUserConfirmation: score < 0.82,
          userChoicesRequired: [],
        };
      })(),
    };
  }
}
