import { Test, TestingModule } from '@nestjs/testing';
import { NuxtDetectorService } from './nuxt-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('NuxtDetectorService', () => {
  let service: NuxtDetectorService;

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
      providers: [NuxtDetectorService],
    }).compile();

    service = module.get<NuxtDetectorService>(NuxtDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.NUXT);
      expect(meta.displayName).toBe('Nuxt');
      expect(meta.priority).toBe(74);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when nuxt.config.ts exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.ts'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when nuxt.config.js exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.js'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when nuxt dep in packageJson', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { nuxt: '^3.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when nuxt in devDependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { devDependencies: { nuxt: '^3.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no nuxt signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns confidence 90 with config + dep', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.ts'];
      ctx.packageJson = { dependencies: { nuxt: '^3.4.0' } };
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(90);
      expect(result.framework).toBe(FrameworkType.NUXT);
    });

    it('detects pages-router feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.ts'];
      ctx.files = ['pages/index.vue', 'pages/about.vue'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('pages-router');
    });

    it('detects server-api feature and sets SSR mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.ts'];
      ctx.files = ['server/api/hello.ts'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('server-api');
      expect(result.buildMode).toBe(BuildMode.SSR);
    });

    it('uses PRODUCTION mode when no server dir', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.ts'];
      ctx.files = ['pages/index.vue'];
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
    });

    it('detects pinia feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['nuxt.config.ts'];
      ctx.packageJson = {
        dependencies: { nuxt: '^3.0.0', '@pinia/nuxt': '^0.5.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('pinia');
    });
  });

  describe('getEnvFileHints', () => {
    it('returns .env.example', () => {
      expect(service.getEnvFileHints()).toContain('.env.example');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates Dockerfile using .output/server/index.mjs', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.NUXT,
        confidence: 90,
        buildMode: BuildMode.SSR,
        nodeVersion: '20',
        detectorName: 'nuxt-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('.output/server/index.mjs');
      expect(plan.dockerfile).toContain('NUXT_HOST=0.0.0.0');
      expect(plan.networking.port).toBe(3000);
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 4000 } };
      const detectionResult = {
        framework: FrameworkType.NUXT,
        confidence: 90,
        nodeVersion: '20',
        detectorName: 'nuxt-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(4000);
    });
  });
});
