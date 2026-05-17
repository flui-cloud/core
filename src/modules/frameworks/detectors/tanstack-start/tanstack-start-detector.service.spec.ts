import { Test, TestingModule } from '@nestjs/testing';
import { TanStackStartDetectorService } from './tanstack-start-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('TanStackStartDetectorService', () => {
  let service: TanStackStartDetectorService;

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
      providers: [TanStackStartDetectorService],
    }).compile();
    service = module.get<TanStackStartDetectorService>(
      TanStackStartDetectorService,
    );
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.TANSTACK_START);
      expect(meta.priority).toBe(68);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when @tanstack/start in dependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { '@tanstack/start': '^1.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when app.config.ts + @tanstack/router present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.config.ts'];
      ctx.packageJson = { dependencies: { '@tanstack/router': '^1.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no tanstack signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns SSR build mode', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: {
          '@tanstack/start': '^1.0.0',
          '@tanstack/router': '^1.0.0',
        },
      };
      ctx.rootFiles = ['app.config.ts'];
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.SSR);
      expect(result.framework).toBe(FrameworkType.TANSTACK_START);
      expect(result.features).toContain('tanstack-router');
    });

    it('detects react-query feature', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: {
          '@tanstack/start': '^1.0.0',
          '@tanstack/react-query': '^5.0.0',
        },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('react-query');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates SSR Dockerfile with .output/server/index.mjs', async () => {
      const ctx = baseContext();
      const result = await service.generateBuildPlan(
        {
          framework: FrameworkType.TANSTACK_START,
          confidence: 80,
          nodeVersion: '20',
          detectorName: 'tanstack-start-detector',
        },
        ctx,
      );
      expect(result.dockerfile).toContain('.output/server/index.mjs');
      expect(result.networking.port).toBe(3000);
    });
  });
});
