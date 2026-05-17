import { Test, TestingModule } from '@nestjs/testing';
import { SvelteKitDetectorService } from './svelte-kit-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('SvelteKitDetectorService', () => {
  let service: SvelteKitDetectorService;

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
      providers: [SvelteKitDetectorService],
    }).compile();

    service = module.get<SvelteKitDetectorService>(SvelteKitDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.SVELTE_KIT);
      expect(meta.displayName).toBe('SvelteKit');
      expect(meta.priority).toBe(73);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when svelte.config.js exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['svelte.config.js'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @sveltejs/kit in devDependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { devDependencies: { '@sveltejs/kit': '^2.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no svelte signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns confidence 100 with config + kit dep + svelte dep', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['svelte.config.js'];
      ctx.packageJson = {
        devDependencies: { '@sveltejs/kit': '^2.0.0', svelte: '^4.0.0' },
        scripts: { build: 'vite build' },
      };
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.framework).toBe(FrameworkType.SVELTE_KIT);
    });

    it('detects file-routing feature from src/routes/', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['svelte.config.js'];
      ctx.files = ['src/routes/+page.svelte', 'src/routes/about/+page.svelte'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('file-routing');
    });

    it('detects adapter-node and sets SSR mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['svelte.config.js'];
      ctx.packageJson = {
        devDependencies: {
          '@sveltejs/kit': '^2.0.0',
          '@sveltejs/adapter-node': '^3.0.0',
        },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('adapter-node');
      expect(result.buildMode).toBe(BuildMode.SSR);
    });

    it('detects adapter-static and sets STATIC mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['svelte.config.js'];
      ctx.packageJson = {
        devDependencies: {
          '@sveltejs/kit': '^2.0.0',
          '@sveltejs/adapter-static': '^3.0.0',
        },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('adapter-static');
      expect(result.buildMode).toBe(BuildMode.STATIC);
    });

    it('detects tailwind feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['svelte.config.js'];
      ctx.packageJson = {
        devDependencies: { '@sveltejs/kit': '^2.0.0', tailwindcss: '^3.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('tailwind');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates node-based Dockerfile for SSR', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.SVELTE_KIT,
        confidence: 85,
        buildMode: BuildMode.SSR,
        features: ['adapter-node'],
        nodeVersion: '20',
        detectorName: 'svelte-kit-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('build/index.js');
      expect(plan.networking.port).toBe(3000);
    });

    it('generates nginx-based Dockerfile for static adapter', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.SVELTE_KIT,
        confidence: 85,
        buildMode: BuildMode.STATIC,
        features: ['adapter-static'],
        nodeVersion: '20',
        detectorName: 'svelte-kit-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('nginx:alpine');
      expect(plan.networking.port).toBe(80);
    });
  });
});
