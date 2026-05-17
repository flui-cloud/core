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
 * Catch-all for Python projects that don't match Django, FastAPI, Flask, or FastHTML.
 * Priority 25 — always loses to specific detectors.
 */
@Injectable()
export class GenericPythonDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(GenericPythonDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.GENERIC_PYTHON,
      displayName: 'Python (Generic)',
      detectorName: 'generic-python-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['3.10+'],
      priority: 25,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('requirements.txt') ||
      context.rootFiles.includes('pyproject.toml') ||
      context.rootFiles.includes('Pipfile') ||
      context.files.some((f) => f.endsWith('.py') && !f.includes('/'))
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Generic Python detector: starting detection');

    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('requirements.txt'))
      features.push('requirements-txt');
    if (context.rootFiles.includes('pyproject.toml'))
      features.push('pyproject');
    if (context.rootFiles.includes('Pipfile')) features.push('pipenv');
    if (
      context.rootFiles.includes('setup.py') ||
      context.rootFiles.includes('setup.cfg')
    )
      features.push('setuptools');
    if (
      !features.some((f) =>
        ['requirements-txt', 'pyproject', 'pipenv'].includes(f),
      )
    ) {
      warnings.push(
        'No requirements.txt or pyproject.toml found — add one for reproducible builds',
      );
    }

    const entrypoint =
      context.rootFiles.find((f) => f.endsWith('.py')) ?? 'main.py';

    return {
      framework: FrameworkType.GENERIC_PYTHON,
      confidence: 25,
      version: '3.12',
      majorVersion: '3',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { entrypoint },
    };
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 8000;
    const entrypoint =
      (detectionResult.metadata?.entrypoint as string) ?? 'main.py';
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
COPY . .
EXPOSE ${port}
CMD ["python", "${entrypoint}"]
`;

    return {
      framework: FrameworkType.GENERIC_PYTHON,
      version: '3.12',
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
        templateVersion: 'generic-python-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_WITH_OVERRIDES,
      deployabilityScore: 0.6,
      deployabilityFactors: {
        frameworkRecognized: false,
        repoClarity: 0.55,
        artifactPredictability: 0.65,
        runtimePredictability: 0.6,
        buildReproducibility: 0.6,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: true,
      userChoicesRequired: [],
    };
  }
}
