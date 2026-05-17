import { Test, TestingModule } from '@nestjs/testing';
import { GoDetectorService } from './go-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('GoDetectorService', () => {
  let service: GoDetectorService;

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
      providers: [GoDetectorService],
    }).compile();

    service = module.get<GoDetectorService>(GoDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.GO);
      expect(meta.displayName).toBe('Go');
      expect(meta.priority).toBe(62);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when go.mod exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.mod'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when go.sum exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.sum'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no go signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns high confidence with go.mod + go.sum + main.go', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.mod', 'go.sum', 'main.go'];
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.framework).toBe(FrameworkType.GO);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
    });

    it('detects cmd-layout feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.mod'];
      ctx.files = ['cmd/server/main.go', 'cmd/migrate/main.go'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('cmd-layout');
    });

    it('detects internal-layout feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.mod'];
      ctx.files = ['internal/handlers/handler.go'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('internal-layout');
    });

    it('detects air-live-reload feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.mod', '.air.toml'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('air-live-reload');
    });

    it('warns when no main.go found', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['go.mod', 'go.sum'];
      ctx.files = ['internal/handlers/handler.go'];
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('main.go'))).toBe(true);
    });
  });

  describe('generateBuildPlan', () => {
    it('generates multi-stage Go Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.GO,
        confidence: 90,
        features: [],
        detectorName: 'go-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('golang:1.23-alpine AS builder');
      expect(plan.dockerfile).toContain('CGO_ENABLED=0');
      expect(plan.dockerfile).toContain('alpine:latest');
      expect(plan.networking.port).toBe(8080);
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 9090 } };
      const detectionResult = {
        framework: FrameworkType.GO,
        confidence: 90,
        features: [],
        detectorName: 'go-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(9090);
    });

    it('sets low memory resource requests (Go is efficient)', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.GO,
        confidence: 90,
        features: [],
        detectorName: 'go-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.resources.memory.request).toBe('64Mi');
    });
  });
});
