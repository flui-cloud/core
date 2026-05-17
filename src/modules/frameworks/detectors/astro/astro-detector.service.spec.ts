import { Test, TestingModule } from '@nestjs/testing';
import { AstroDetectorService } from './astro-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('AstroDetectorService', () => {
  let service: AstroDetectorService;

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
      providers: [AstroDetectorService],
    }).compile();

    service = module.get<AstroDetectorService>(AstroDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.ASTRO);
      expect(meta.displayName).toBe('Astro');
      expect(meta.priority).toBe(71);
      expect(meta.category).toBe('frontend');
    });
  });

  describe('canDetect', () => {
    it('returns true when astro.config.mjs exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['astro.config.mjs'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when astro dep present', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { astro: '^4.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no astro signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns confidence 100 with config + dep + pages', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['astro.config.mjs'];
      ctx.files = ['src/pages/index.astro'];
      ctx.packageJson = {
        dependencies: { astro: '^4.0.0' },
        scripts: { build: 'astro build' },
      };
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.framework).toBe(FrameworkType.ASTRO);
    });

    it('defaults to STATIC build mode without adapter-node', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['astro.config.mjs'];
      ctx.packageJson = { dependencies: { astro: '^4.0.0' } };
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.STATIC);
    });

    it('sets SSR mode when @astrojs/node adapter present', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['astro.config.mjs'];
      ctx.packageJson = {
        dependencies: { astro: '^4.0.0', '@astrojs/node': '^8.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.SSR);
      expect(result.features).toContain('adapter-node');
    });

    it('detects react integration', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { astro: '^4.0.0', '@astrojs/react': '^3.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('react');
    });

    it('detects mdx integration', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { astro: '^4.0.0', '@astrojs/mdx': '^2.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('mdx');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates nginx Dockerfile for static output', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.ASTRO,
        confidence: 90,
        buildMode: BuildMode.STATIC,
        features: [],
        nodeVersion: '20',
        detectorName: 'astro-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('nginx:alpine');
      expect(plan.networking.port).toBe(80);
    });

    it('generates node Dockerfile for SSR output', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.ASTRO,
        confidence: 90,
        buildMode: BuildMode.SSR,
        features: ['adapter-node'],
        nodeVersion: '20',
        detectorName: 'astro-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('entry.mjs');
      expect(plan.networking.port).toBe(4321);
    });
  });
});
