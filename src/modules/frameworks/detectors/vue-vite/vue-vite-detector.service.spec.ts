import { Test, TestingModule } from '@nestjs/testing';
import { VueViteDetectorService } from './vue-vite-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('VueViteDetectorService', () => {
  let service: VueViteDetectorService;

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
      providers: [VueViteDetectorService],
    }).compile();

    service = module.get<VueViteDetectorService>(VueViteDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.VUE_VITE);
      expect(meta.displayName).toBe('Vue (Vite)');
      expect(meta.priority).toBe(70);
      expect(meta.category).toBe('frontend');
    });
  });

  describe('canDetect', () => {
    it('returns true when vite config + vue dep present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = { dependencies: { vue: '^3.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @vitejs/plugin-vue present alone', () => {
      const ctx = baseContext();
      ctx.packageJson = { devDependencies: { '@vitejs/plugin-vue': '^4.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when only vue dep but no vite', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { vue: '^3.0.0' } };
      expect(service.canDetect(ctx)).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns 100 confidence with vite config + plugin + vue dep', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { vue: '^3.3.0' },
        devDependencies: { '@vitejs/plugin-vue': '^4.0.0' },
        scripts: { build: 'vite build' },
      };
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.buildMode).toBe(BuildMode.SPA);
    });

    it('detects pinia feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { vue: '^3.0.0', pinia: '^2.0.0' },
        devDependencies: { '@vitejs/plugin-vue': '^4.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('pinia');
    });

    it('detects vue-router feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { vue: '^3.0.0', 'vue-router': '^4.0.0' },
        devDependencies: { '@vitejs/plugin-vue': '^4.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('vue-router');
    });

    it('detects jsx feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { vue: '^3.0.0' },
        devDependencies: { '@vitejs/plugin-vue-jsx': '^3.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('jsx');
    });

    it('warns when no build script found', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        devDependencies: { '@vitejs/plugin-vue': '^4.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('generateBuildPlan', () => {
    it('generates nginx-based Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.VUE_VITE,
        confidence: 100,
        buildMode: BuildMode.SPA,
        nodeVersion: '20',
        detectorName: 'vue-vite-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('nginx:alpine');
      expect(plan.networking.port).toBe(80);
    });

    it('uses yarn when packageManager is yarn', async () => {
      const ctx = baseContext();
      ctx.packageManager = 'yarn';
      const detectionResult = {
        framework: FrameworkType.VUE_VITE,
        confidence: 100,
        nodeVersion: '20',
        detectorName: 'vue-vite-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('yarn install --frozen-lockfile');
    });
  });
});
