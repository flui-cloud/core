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
export class GoDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(GoDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.GO,
      displayName: 'Go',
      detectorName: 'go-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['1.20+'],
      priority: 62,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    return (
      context.rootFiles.includes('go.mod') ||
      context.rootFiles.includes('go.sum')
    );
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Go detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    if (context.rootFiles.includes('go.mod')) confidence += 70;
    if (context.rootFiles.includes('go.sum')) confidence += 20;
    if (
      context.rootFiles.includes('main.go') ||
      context.files.some((f) => f.endsWith('main.go'))
    )
      confidence += 10;

    // Detect common Go web frameworks
    if (context.files.some((f) => f.includes('gin') || f.includes('gin-gonic')))
      features.push('gin');
    if (context.files.some((f) => f.includes('fiber'))) features.push('fiber');
    if (context.files.some((f) => f.includes('echo'))) features.push('echo');
    if (context.files.some((f) => f.includes('chi'))) features.push('chi');
    if (context.files.some((f) => f.includes('gorilla/mux')))
      features.push('gorilla-mux');

    // Project structure signals
    if (context.files.some((f) => f.startsWith('cmd/')))
      features.push('cmd-layout');
    if (context.files.some((f) => f.startsWith('internal/')))
      features.push('internal-layout');
    if (context.files.some((f) => f.startsWith('pkg/')))
      features.push('pkg-layout');
    if (context.files.some((f) => f.startsWith('api/')))
      features.push('api-layout');
    if (context.rootFiles.includes('Makefile')) features.push('makefile');
    if (
      context.rootFiles.includes('.air.toml') ||
      context.files.some((f) => f.endsWith('.air.toml'))
    )
      features.push('air-live-reload');

    if (
      !context.rootFiles.includes('main.go') &&
      !context.files.some((f) => f.endsWith('main.go'))
    ) {
      warnings.push(
        'No main.go found in root — ensure your entry point is configured correctly',
      );
    }

    return {
      framework: FrameworkType.GO,
      confidence,
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      packageManager: context.packageManager,
      nodeVersion: context.nodeVersion,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: { hasGoMod: context.rootFiles.includes('go.mod') },
    };
  }

  getEnvFileHints(): string[] {
    return ['.env.example', '.env.template'];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 8080;

    const dockerfile = `FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./...

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
ENV PORT=${port}
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE ${port}
CMD ["./server"]
`;

    return {
      framework: FrameworkType.GO,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.PRODUCTION,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '100m', limit: '300m' },
        memory: { request: '64Mi', limit: '128Mi' },
      },
      healthCheck: {
        enabled: true,
        path: '/health',
        port,
        initialDelaySeconds: 5,
        periodSeconds: 10,
        timeoutSeconds: 5,
        successThreshold: 1,
        failureThreshold: 3,
      },
      networking: { port, protocol: 'http', ingressEnabled: true },
      scaling: {
        enabled: true,
        minReplicas: 1,
        maxReplicas: 10,
        targetCPUUtilization: 70,
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: 'go-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy: DeployStrategy.RAILPACK_DIRECT,
      deployabilityScore:
        context.files.some((f) => f.endsWith('go.mod')) &&
        context.files.some((f) => f.endsWith('main.go'))
          ? 0.9
          : 0.75,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: context.files.some((f) => f.endsWith('main.go')) ? 1 : 0.7,
        artifactPredictability: 0.95,
        runtimePredictability: 0.9,
        buildReproducibility: 0.95,
      },
      projectWarnings: detectionResult.warnings ?? [],
      requiresUserConfirmation: false,
      userChoicesRequired: [],
    };
  }
}
