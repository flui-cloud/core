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
export class AspNetCoreDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(AspNetCoreDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.ASPNET_CORE,
      displayName: 'ASP.NET Core',
      detectorName: 'aspnet-core-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['6.x', '7.x', '8.x', '9.x'],
      priority: 59,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.files.some((f) => f.endsWith('.csproj')) ||
      context.rootFiles.includes('global.json') ||
      context.files.some((f) => f === 'Program.cs' || f.endsWith('/Program.cs'))
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('ASP.NET Core detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const csprojFiles = context.files.filter((f) => f.endsWith('.csproj'));
    if (csprojFiles.length > 0) {
      confidence += 60;
      features.push('csproj');
    }

    const hasSln = context.files.some((f) => f.endsWith('.sln'));
    if (hasSln) {
      confidence += 10;
      features.push('solution');
    }

    const hasProgram = context.files.some(
      (f) => f === 'Program.cs' || f.endsWith('/Program.cs'),
    );
    if (hasProgram) confidence += 20;

    const hasAppsettings = context.rootFiles.includes('appsettings.json');
    if (hasAppsettings) {
      confidence += 10;
      features.push('appsettings');
    }

    const hasGlobalJson = context.rootFiles.includes('global.json');
    if (hasGlobalJson) {
      confidence += 5;
      features.push('global-json');
    }

    // Detect project type
    if (
      context.files.some(
        (f) => f.includes('Controllers/') && f.endsWith('Controller.cs'),
      )
    )
      features.push('mvc-controllers');
    if (
      context.files.some(
        (f) =>
          f.endsWith('Program.cs') &&
          context.files.some((g) => g.endsWith('Minimal')),
      )
    )
      features.push('minimal-api');
    if (
      context.files.some((f) => f.includes('Migrations/') && f.endsWith('.cs'))
    )
      features.push('ef-core');
    if (
      context.files.some((f) => f.endsWith('.razor') || f.endsWith('.cshtml'))
    )
      features.push('razor');
    if (context.files.some((f) => f.includes('Hub') && f.endsWith('.cs')))
      features.push('signalr');
    if (
      context.files.some(
        (f) => f.includes('grpc') || f.includes('Grpc') || f.endsWith('.proto'),
      )
    )
      features.push('grpc');

    // Try to extract .NET version from global.json or csproj name patterns
    const dotnetVersion = hasGlobalJson ? 'detected-in-global-json' : '8';

    if (csprojFiles.length === 0 && !hasProgram) {
      warnings.push(
        'Could not find .csproj or Program.cs — detection confidence is low',
      );
    }

    // Extract project name from first csproj
    const projectName =
      csprojFiles.length > 0
        ? (csprojFiles[0].split('/').pop()?.replace('.csproj', '') ?? 'App')
        : 'App';

    return {
      framework: FrameworkType.ASPNET_CORE,
      confidence: Math.min(confidence, 100),
      version: dotnetVersion,
      majorVersion: '8',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { projectName, csprojFiles },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', 'appsettings.Development.json'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 8080;

    return {
      framework: FrameworkType.ASPNET_CORE,
      version: detectionResult.version ?? '8',
      buildMode: BuildMode.PRODUCTION,
      dockerfile: '',
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '250m', limit: '500m' },
        memory: { request: '256Mi', limit: '512Mi' },
      },
      networking: { port, protocol: 'http', ingressEnabled: true },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'aspnet-core-1.0',
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
        'ASP.NET Core is not supported by Railpack. Automatic build is not available.',
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
