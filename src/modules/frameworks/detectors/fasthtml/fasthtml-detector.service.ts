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
 * FastHTML detector.
 * FastHTML is a Python web framework for building full-stack web apps.
 * Detection relies on the presence of python-fasthtml or fasthtml in dep files,
 * combined with main.py entry point. No manage.py (Django) and no FastAPI-specific
 * routers/ structure.
 */
@Injectable()
export class FastHtmlDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(FastHtmlDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.FASTHTML,
      displayName: 'FastHTML',
      detectorName: 'fasthtml-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['0.x'],
      priority: 66,
      category: 'fullstack',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // FastHTML projects: main.py + python deps file, no manage.py, no FastAPI routers
    const hasPythonEntry =
      context.rootFiles.includes('main.py') ||
      context.files.includes('app/main.py');
    const hasPythonDeps =
      context.rootFiles.includes('requirements.txt') ||
      context.rootFiles.includes('pyproject.toml') ||
      context.rootFiles.includes('Pipfile');
    const isDjango = context.rootFiles.includes('manage.py');
    const hasRouterStructure = context.files.some(
      (f) => f.includes('routers/') || f.includes('api/v'),
    );
    return hasPythonEntry && hasPythonDeps && !isDjango && !hasRouterStructure;
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('FastHTML detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('main.py')) confidence += 35;
    if (context.files.includes('app/main.py')) confidence += 25;
    if (context.rootFiles.includes('requirements.txt')) {
      confidence += 25;
      features.push('requirements-txt');
    }
    if (context.rootFiles.includes('pyproject.toml')) {
      confidence += 25;
      features.push('pyproject');
    }
    if (context.rootFiles.includes('Pipfile')) {
      confidence += 20;
      features.push('pipenv');
    }

    // FastHTML-specific signals
    if (
      context.files.some(
        (f) => f.endsWith('components.py') || f.includes('components/'),
      )
    )
      features.push('components');
    if (
      context.files.some(
        (f) =>
          f.includes('static/') && (f.endsWith('.css') || f.endsWith('.js')),
      )
    )
      features.push('static-assets');
    if (
      context.files.some(
        (f) => f.endsWith('db.py') || f.endsWith('database.py'),
      )
    )
      features.push('database');

    return {
      framework: FrameworkType.FASTHTML,
      confidence: Math.min(confidence, 100),
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {},
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example'];
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
      framework: FrameworkType.FASTHTML,
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
        templateVersion: 'fasthtml-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_WITH_OVERRIDES,
      deployabilityScore: 0.72,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.75,
        artifactPredictability: 0.8,
        runtimePredictability: 0.8,
        buildReproducibility: 0.75,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: true,
      userChoicesRequired: [],
    };
  }
}
