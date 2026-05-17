import { Test, TestingModule } from '@nestjs/testing';
import { SpringBootDetectorService } from './spring-boot-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('SpringBootDetectorService', () => {
  let service: SpringBootDetectorService;

  const baseContext = (): IDetectionContext => ({
    repositoryPath: '/test/repo',
    files: [],
    rootFiles: [],
    lockfilePresent: false,
    hasCIConfig: false,
    hasTests: false,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpringBootDetectorService],
    }).compile();

    service = module.get<SpringBootDetectorService>(SpringBootDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.SPRING_BOOT);
      expect(meta.displayName).toBe('Spring Boot');
      expect(meta.priority).toBe(63);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when pom.xml present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pom.xml'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when build.gradle present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['build.gradle'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when build.gradle.kts present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['build.gradle.kts'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no Java build file', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns high confidence with Maven + src/main/java + Application.java', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pom.xml', 'mvnw'];
      ctx.files = [
        'src/main/java/com/example/DemoApplication.java',
        'src/main/resources/application.properties',
      ];
      const result = await service.detect(ctx);
      expect(result.confidence).toBeGreaterThanOrEqual(90);
      expect(result.framework).toBe(FrameworkType.SPRING_BOOT);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.features).toContain('maven');
      expect(result.features).toContain('wrapper');
    });

    it('returns high confidence with Gradle Kotlin DSL', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['build.gradle.kts', 'gradlew'];
      ctx.files = ['src/main/java/com/example/App.java'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('gradle-kotlin');
      expect(result.features).toContain('wrapper');
    });

    it('detects web-mvc feature from Controller files', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pom.xml'];
      ctx.files = ['src/main/java/com/example/UserController.java'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('web-mvc');
    });

    it('detects jpa feature from Repository files', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pom.xml'];
      ctx.files = ['src/main/java/com/example/UserRepository.java'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('jpa');
    });

    it('detects security feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pom.xml'];
      ctx.files = ['src/main/java/com/example/SecurityConfig.java'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('security');
    });

    it('detects application-config from application.yml', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pom.xml'];
      ctx.files = ['src/main/resources/application.yml'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('application-config');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates Maven multi-stage Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.SPRING_BOOT,
        confidence: 90,
        features: ['maven', 'wrapper'],
        metadata: { buildTool: 'maven', hasWrapper: true },
        detectorName: 'spring-boot-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('maven:3-eclipse-temurin-21-alpine');
      expect(plan.dockerfile).toContain('./mvnw package');
      expect(plan.dockerfile).toContain('eclipse-temurin:21-jre-alpine');
      expect(plan.networking.port).toBe(8080);
    });

    it('generates Gradle Dockerfile when buildTool is gradle', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.SPRING_BOOT,
        confidence: 85,
        features: ['gradle'],
        metadata: { buildTool: 'gradle', hasWrapper: false },
        detectorName: 'spring-boot-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('gradle:8-jdk21-alpine');
      expect(plan.dockerfile).toContain('gradle bootJar');
    });

    it('uses Maven wrapper when wrapper feature present', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.SPRING_BOOT,
        confidence: 90,
        features: ['maven', 'wrapper'],
        metadata: { buildTool: 'maven', hasWrapper: true },
        detectorName: 'spring-boot-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('./mvnw');
    });

    it('sets health check to /actuator/health', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.SPRING_BOOT,
        confidence: 90,
        features: ['maven'],
        metadata: { buildTool: 'maven', hasWrapper: false },
        detectorName: 'spring-boot-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.healthCheck.path).toBe('/actuator/health');
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 9090 } };
      const detectionResult = {
        framework: FrameworkType.SPRING_BOOT,
        confidence: 90,
        features: ['maven'],
        metadata: { buildTool: 'maven', hasWrapper: false },
        detectorName: 'spring-boot-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(9090);
    });
  });
});
