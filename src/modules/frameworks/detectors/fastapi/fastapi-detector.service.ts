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
export class FastApiDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(FastApiDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.FASTAPI,
      displayName: 'FastAPI',
      detectorName: 'fastapi-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['0.x'],
      priority: 67,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // FastAPI projects typically have main.py or app/main.py and pyproject.toml or requirements.txt
    const hasPythonEntry =
      context.rootFiles.includes('main.py') ||
      context.files.some((f) => f === 'app/main.py' || f === 'src/main.py');
    const hasPythonDeps =
      context.rootFiles.includes('requirements.txt') ||
      context.rootFiles.includes('pyproject.toml') ||
      context.rootFiles.includes('Pipfile');
    return (
      hasPythonEntry &&
      hasPythonDeps &&
      !context.rootFiles.includes('manage.py')
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('FastAPI detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (
      context.rootFiles.includes('main.py') ||
      context.files.includes('app/main.py')
    )
      confidence += 30;
    if (context.rootFiles.includes('pyproject.toml')) {
      confidence += 25;
      features.push('pyproject');
    }
    if (context.rootFiles.includes('requirements.txt')) {
      confidence += 20;
      features.push('requirements-txt');
    }
    if (context.rootFiles.includes('Pipfile')) {
      confidence += 15;
      features.push('pipenv');
    }

    // FastAPI-specific signals
    if (
      context.files.some((f) => f.includes('routers/') || f.includes('api/v'))
    ) {
      confidence += 15;
      features.push('routers');
    }
    if (
      context.files.some(
        (f) => f.endsWith('schemas.py') || f.endsWith('models.py'),
      )
    )
      features.push('pydantic-models');
    if (context.files.some((f) => f.includes('alembic') || f === 'alembic.ini'))
      features.push('alembic');
    if (context.files.some((f) => f.includes('celery')))
      features.push('celery');
    if (
      context.rootFiles.includes('docker-compose.yml') ||
      context.rootFiles.includes('docker-compose.yaml')
    )
      features.push('docker-compose');

    if (warnings.length === 0 && confidence < 40) {
      warnings.push(
        'Low confidence FastAPI detection — verify this is a FastAPI project',
      );
    }

    return {
      framework: FrameworkType.FASTAPI,
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
        hasMainPy:
          context.rootFiles.includes('main.py') ||
          context.files.includes('app/main.py'),
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
    const port = context.fluiConfig?.runtime?.port ?? 8000;
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

    const dockerfile = `FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=${port}
WORKDIR /app
COPY requirements*.txt pyproject.toml* Pipfile* ./
${installStep}
RUN pip install uvicorn[standard]
COPY . .
EXPOSE ${port}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${port}"]
`;

    return {
      framework: FrameworkType.FASTAPI,
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
        path: '/health',
        port,
        initialDelaySeconds: 15,
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
        templateVersion: 'fastapi-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      ...(() => {
        const hasRequirements =
          detectionResult.features?.some((f) =>
            ['requirements-txt', 'pyproject', 'pipenv'].includes(f),
          ) ?? false;
        const score = hasRequirements ? 0.84 : 0.7;
        const warnings = [...(detectionResult.warnings ?? [])];
        if (!hasRequirements)
          warnings.push('No requirements.txt or pyproject.toml found');
        return {
          deployStrategy: hasRequirements
            ? DeployStrategy.RAILPACK_DIRECT
            : DeployStrategy.RAILPACK_WITH_OVERRIDES,
          deployabilityScore: score,
          deployabilityFactors: {
            frameworkRecognized: true,
            repoClarity: 0.85,
            artifactPredictability: 0.85,
            runtimePredictability: 0.9,
            buildReproducibility: hasRequirements ? 0.85 : 0.55,
          },
          suggestedStartCommand: 'uvicorn main:app --host 0.0.0.0 --port 8000',
          projectWarnings: warnings,
          requiresUserConfirmation: score < 0.82,
          userChoicesRequired: [],
        };
      })(),
    };
  }
}
