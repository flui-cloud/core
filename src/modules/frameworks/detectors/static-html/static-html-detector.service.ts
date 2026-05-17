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
export class StaticHtmlDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(StaticHtmlDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.STATIC_HTML,
      displayName: 'Static HTML',
      detectorName: 'static-html-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['any'],
      priority: 40,
      category: 'frontend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    const hasHtml = context.rootFiles.includes('index.html');
    const hasNoPackageJson = !context.rootFiles.includes('package.json');
    const hasNoAppCode =
      !context.rootFiles.includes('pom.xml') &&
      !context.rootFiles.includes('go.mod') &&
      !context.rootFiles.includes('Gemfile') &&
      !context.rootFiles.includes('requirements.txt') &&
      !context.rootFiles.includes('mix.exs');
    return hasHtml && hasNoPackageJson && hasNoAppCode;
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Static HTML detector: starting detection');

    let confidence = 0;
    const features: string[] = [];

    if (context.rootFiles.includes('index.html')) confidence += 60;
    if (context.files.some((f) => f.endsWith('.css'))) {
      confidence += 15;
      features.push('css');
    }
    if (context.files.some((f) => f.endsWith('.js'))) {
      confidence += 15;
      features.push('javascript');
    }
    if (context.files.some((f) => f.endsWith('.ts') && !f.endsWith('.d.ts')))
      features.push('typescript');
    if (context.rootFiles.includes('404.html')) features.push('custom-404');

    return {
      framework: FrameworkType.STATIC_HTML,
      confidence: Math.min(confidence, 100),
      version: 'static',
      majorVersion: 'static',
      buildMode: BuildMode.STATIC,
      features,
      warnings: [],
      detectorName: this.getMetadata().detectorName,
      metadata: {},
    };
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 80;

    const dockerfile = `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE ${port}
CMD ["nginx", "-g", "daemon off;"]
`;

    return {
      framework: FrameworkType.STATIC_HTML,
      version: 'static',
      buildMode: BuildMode.STATIC,
      dockerfile,
      buildContext: '.',
      buildEnv: [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '50m', limit: '100m' },
        memory: { request: '32Mi', limit: '64Mi' },
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
        templateVersion: 'static-html-1.0',
        generatedAt: new Date(),
        warnings: [],
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore: 0.9,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: 0.95,
        artifactPredictability: 0.95,
        runtimePredictability: 1,
        buildReproducibility: 0.95,
      },
      projectWarnings: [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
    };
  }
}
