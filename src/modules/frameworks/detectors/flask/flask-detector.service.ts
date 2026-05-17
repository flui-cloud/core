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
export class FlaskDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(FlaskDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.FLASK,
      displayName: 'Flask',
      detectorName: 'flask-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['2.x', '3.x'],
      priority: 60,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // Flask projects: has app.py / wsgi.py / application.py at root, Python deps file, no manage.py (that's Django)
    const hasPythonEntry =
      context.rootFiles.includes('app.py') ||
      context.rootFiles.includes('application.py') ||
      context.rootFiles.includes('wsgi.py') ||
      context.files.includes('app/__init__.py');
    const hasPythonDeps =
      context.rootFiles.includes('requirements.txt') ||
      context.rootFiles.includes('pyproject.toml') ||
      context.rootFiles.includes('Pipfile');
    return (
      hasPythonEntry &&
      hasPythonDeps &&
      !context.rootFiles.includes('manage.py') &&
      !context.rootFiles.includes('main.py')
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Flask detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('app.py')) confidence += 35;
    if (context.rootFiles.includes('application.py')) confidence += 30;
    if (context.rootFiles.includes('wsgi.py')) {
      confidence += 20;
      features.push('wsgi');
    }
    if (context.files.includes('app/__init__.py')) confidence += 25;
    if (context.rootFiles.includes('requirements.txt')) {
      confidence += 15;
      features.push('requirements-txt');
    }
    if (context.rootFiles.includes('pyproject.toml')) {
      confidence += 15;
      features.push('pyproject');
    }
    if (context.rootFiles.includes('Pipfile')) {
      confidence += 15;
      features.push('pipenv');
    }

    if (
      context.files.some(
        (f) => f.includes('blueprints/') || f.includes('views.py'),
      )
    )
      features.push('blueprints');
    if (
      context.files.some((f) => f.includes('models.py') || f.includes('db.py'))
    )
      features.push('database');
    if (context.files.some((f) => f.includes('migrations/')))
      features.push('flask-migrate');
    if (context.files.some((f) => f.includes('celery')))
      features.push('celery');
    if (context.rootFiles.includes('Makefile')) features.push('makefile');

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
      framework: FrameworkType.FLASK,
      confidence,
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {
        entrypoint: context.rootFiles.includes('app.py')
          ? 'app.py'
          : 'application.py',
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
    const port = context.fluiConfig?.runtime?.port ?? 5000;
    const hasPipfile = detectionResult.features?.includes('pipenv');
    const hasPyproject = detectionResult.features?.includes('pyproject');
    const entrypoint =
      (detectionResult.metadata?.entrypoint as string) ?? 'app.py';
    const appVar = entrypoint.replace('.py', '') + ':app';

    let installStep: string;
    if (hasPipfile) {
      installStep =
        'RUN pip install pipenv && pipenv install --deploy --system';
    } else if (hasPyproject) {
      installStep = 'RUN pip install .';
    } else {
      installStep = 'RUN pip install --no-cache-dir -r requirements.txt';
    }

    const dockerfile = `FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=${port}
WORKDIR /app
COPY requirements*.txt pyproject.toml* Pipfile* ./
${installStep}
RUN pip install gunicorn
COPY . .
EXPOSE ${port}
CMD ["gunicorn", "--bind", "0.0.0.0:${port}", "--workers", "4", "${appVar}"]
`;

    return {
      framework: FrameworkType.FLASK,
      version: detectionResult.version ?? 'unknown',
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
        enabled: true,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilization: 70,
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'flask-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      ...(() => {
        const hasRequirements =
          detectionResult.features?.some((f) =>
            ['requirements-txt', 'pyproject', 'pipenv'].includes(f),
          ) ?? false;
        const score = hasRequirements ? 0.72 : 0.55;
        const warnings = [...(detectionResult.warnings ?? [])];
        if (!hasRequirements)
          warnings.push('No requirements.txt or pyproject.toml found');
        return {
          deployStrategy: DeployStrategy.RAILPACK_WITH_OVERRIDES,
          deployabilityScore: score,
          deployabilityFactors: {
            frameworkRecognized: true,
            repoClarity: 0.75,
            artifactPredictability: 0.8,
            runtimePredictability: 0.75,
            buildReproducibility: hasRequirements ? 0.8 : 0.5,
          },
          projectWarnings: warnings,
          requiresUserConfirmation: true,
          userChoicesRequired: [],
        };
      })(),
    };
  }
}
