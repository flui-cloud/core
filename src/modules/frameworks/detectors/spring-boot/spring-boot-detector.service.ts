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
export class SpringBootDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(SpringBootDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.SPRING_BOOT,
      displayName: 'Spring Boot',
      detectorName: 'spring-boot-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['2.x', '3.x'],
      priority: 63,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    const hasMaven = context.rootFiles.includes('pom.xml');
    const hasGradle =
      context.rootFiles.includes('build.gradle') ||
      context.rootFiles.includes('build.gradle.kts');
    return hasMaven || hasGradle;
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    this.logger.log('Spring Boot detector: starting detection');

    let confidence = 0;
    const features: string[] = [];
    const warnings: string[] = [];

    const hasMaven = context.rootFiles.includes('pom.xml');
    const hasGradle =
      context.rootFiles.includes('build.gradle') ||
      context.rootFiles.includes('build.gradle.kts');
    const hasGradleKts = context.rootFiles.includes('build.gradle.kts');

    if (hasMaven) {
      confidence += 40;
      features.push('maven');
    }
    if (hasGradle) {
      confidence += 40;
      features.push(hasGradleKts ? 'gradle-kotlin' : 'gradle');
    }

    // Spring-specific file signals
    if (context.files.some((f) => f.startsWith('src/main/java/')))
      confidence += 30;
    if (context.files.some((f) => f.endsWith('Application.java')))
      confidence += 20;
    if (
      context.files.some(
        (f) =>
          f.endsWith('application.properties') || f.endsWith('application.yml'),
      )
    ) {
      confidence += 10;
      features.push('application-config');
    }

    // Spring Boot wrapper scripts
    if (
      context.rootFiles.includes('mvnw') ||
      context.rootFiles.includes('gradlew')
    ) {
      confidence += 5;
      features.push('wrapper');
    }

    // Detect common Spring Boot features
    if (context.files.some((f) => f.includes('Controller.java')))
      features.push('web-mvc');
    if (
      context.files.some(
        (f) => f.includes('Repository.java') || f.includes('JpaRepository'),
      )
    )
      features.push('jpa');
    if (
      context.files.some((f) => f.includes('Security') && f.endsWith('.java'))
    )
      features.push('security');
    if (
      context.files.some(
        (f) => f.includes('swagger') || f.includes('springdoc'),
      )
    )
      features.push('openapi');
    if (
      context.files.some((f) => f.endsWith('.Dockerfile') || f === 'Dockerfile')
    )
      features.push('docker-ready');
    if (
      context.rootFiles.includes('docker-compose.yml') ||
      context.rootFiles.includes('docker-compose.yaml')
    )
      features.push('docker-compose');

    if (confidence === 0) {
      warnings.push('No Maven or Gradle build file found');
    }

    return {
      framework: FrameworkType.SPRING_BOOT,
      confidence: Math.min(confidence, 100),
      version: 'unknown',
      majorVersion: 'unknown',
      buildMode: BuildMode.PRODUCTION,
      features,
      warnings,
      detectorName: this.getMetadata().detectorName,
      metadata: {
        buildTool: hasMaven ? 'maven' : 'gradle',
        hasWrapper: features.includes('wrapper'),
      },
    };
  }

  getEnvFileHints(): string[] {
    return [
      '.env.example',
      'src/main/resources/application.properties',
      'src/main/resources/application-*.properties',
      'src/main/resources/application.yml',
      'src/main/resources/application-*.yml',
    ];
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    const port = context.fluiConfig?.runtime?.port ?? 8080;
    const buildTool =
      (detectionResult.metadata?.buildTool as string) ?? 'maven';
    const hasWrapper = detectionResult.features?.includes('wrapper');
    const isMaven = buildTool === 'maven';

    // ── Advisor: deployability assessment ────────────────────────────────
    const pomCount = context.files.filter((f) => f.endsWith('pom.xml')).length;
    const buildGradleInSubdir = context.files
      .filter(
        (f) => f.endsWith('build.gradle') || f.endsWith('build.gradle.kts'),
      )
      .some((f) => f.includes('/'));
    const isMultiModule = pomCount > 1 || buildGradleInSubdir;

    let deployStrategy: DeployStrategy;
    let suggestedBuildCommand: string | undefined;
    let suggestedStartCommand: string | undefined;
    const projectWarnings: string[] = [...(detectionResult.warnings ?? [])];
    const recommendedStructure: string[] = [];

    if (!isMultiModule && hasWrapper) {
      deployStrategy = DeployStrategy.RAILPACK_WITH_OVERRIDES;
      suggestedBuildCommand = isMaven
        ? './mvnw -DskipTests -B package'
        : './gradlew bootJar';
      suggestedStartCommand = isMaven
        ? 'java -jar target/*.jar'
        : 'java -jar build/libs/*.jar';
    } else {
      deployStrategy = DeployStrategy.DOCKERFILE;
      if (!hasWrapper) {
        projectWarnings.push(
          'No Maven/Gradle wrapper found — consider adding mvnw/gradlew',
        );
        recommendedStructure.push(
          'Run `mvn wrapper:wrapper` or `gradle wrapper` to generate the wrapper',
        );
      }
      if (isMultiModule) {
        projectWarnings.push(
          'Multi-module project detected — using Dockerfile for predictable artifact resolution',
        );
        recommendedStructure.push(
          'Consider isolating the deployable module in a dedicated folder',
        );
      }
    }

    const deployabilityScore =
      deployStrategy === DeployStrategy.RAILPACK_WITH_OVERRIDES ? 0.8 : 0.7;
    const requiresUserConfirmation = deployabilityScore < 0.82;

    let buildCmd: string;
    if (isMaven) {
      buildCmd = hasWrapper
        ? './mvnw package -DskipTests -B'
        : 'mvn package -DskipTests -B';
    } else {
      buildCmd = hasWrapper ? './gradlew bootJar' : 'gradle bootJar';
    }

    const jarPath = isMaven ? 'target/*.jar' : 'build/libs/*.jar';

    const builderImage = isMaven
      ? 'maven:3-eclipse-temurin-21-alpine'
      : 'gradle:8-jdk21-alpine';

    const dockerfile = `FROM ${builderImage} AS builder
WORKDIR /app
${isMaven ? 'COPY pom.xml .' : 'COPY build.gradle* settings.gradle* gradle* ./'}
${isMaven ? 'RUN mvn dependency:go-offline -B' : 'COPY gradle ./gradle\nRUN gradle dependencies --no-daemon'}
COPY src ./src
RUN ${buildCmd}

FROM eclipse-temurin:21-jre-alpine
ENV SERVER_PORT=${port}
WORKDIR /app
COPY --from=builder /app/${jarPath} app.jar
EXPOSE ${port}
CMD ["java", "-jar", "app.jar"]
`;

    return {
      framework: FrameworkType.SPRING_BOOT,
      version: detectionResult.version ?? 'unknown',
      buildMode: BuildMode.PRODUCTION,
      dockerfile,
      buildContext: '.',
      buildEnv: context.fluiConfig?.build?.env ?? [],
      runtimeEnv: context.fluiConfig?.runtime?.env ?? [],
      resources: {
        cpu: { request: '500m', limit: '1000m' },
        memory: { request: '512Mi', limit: '1Gi' },
      },
      healthCheck: {
        enabled: true,
        path: '/actuator/health',
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
        templateVersion: 'spring-boot-1.0',
        generatedAt: new Date(),
        warnings: detectionResult.warnings,
      },
      deployStrategy,
      deployabilityScore,
      deployabilityFactors: {
        frameworkRecognized: true,
        repoClarity: hasWrapper ? 0.9 : 0.6,
        artifactPredictability: isMultiModule ? 0.6 : 0.85,
        runtimePredictability: 0.8,
        buildReproducibility: hasWrapper ? 0.9 : 0.65,
      },
      suggestedBuildCommand,
      suggestedStartCommand,
      projectWarnings,
      recommendedStructure: recommendedStructure.length
        ? recommendedStructure
        : undefined,
      requiresUserConfirmation,
      userChoicesRequired: [],
    };
  }
}
