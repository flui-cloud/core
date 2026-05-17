import { Test, TestingModule } from '@nestjs/testing';
import { ReactViteDetectorService } from './react-vite-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('ReactViteDetectorService', () => {
  let service: ReactViteDetectorService;

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
      providers: [ReactViteDetectorService],
    }).compile();

    service = module.get<ReactViteDetectorService>(ReactViteDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.REACT_VITE);
      expect(meta.displayName).toBe('React (Vite)');
      expect(meta.priority).toBe(72);
      expect(meta.category).toBe('frontend');
      expect(meta.official).toBe(true);
    });
  });

  describe('canDetect', () => {
    it('returns true when vite.config.ts + react dep present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = { dependencies: { react: '^18.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @vitejs/plugin-react present alone', () => {
      const ctx = baseContext();
      ctx.packageJson = {
        devDependencies: { '@vitejs/plugin-react': '^4.0.0' },
      };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @vitejs/plugin-react-swc present', () => {
      const ctx = baseContext();
      ctx.packageJson = {
        devDependencies: { '@vitejs/plugin-react-swc': '^3.0.0' },
      };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when only react dep but no vite config or plugin', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { react: '^18.0.0' } };
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when empty context', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns full confidence with vite config + plugin + react dep', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { react: '^18.2.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.0.0' },
        scripts: { build: 'vite build' },
      };
      const result = await service.detect(ctx);
      expect(result.framework).toBe(FrameworkType.REACT_VITE);
      expect(result.confidence).toBe(100);
      expect(result.buildMode).toBe(BuildMode.SPA);
    });

    it('detects swc feature when plugin-react-swc used', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { react: '^18.0.0' },
        devDependencies: { '@vitejs/plugin-react-swc': '^3.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('swc');
    });

    it('detects react-router feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { react: '^18.0.0', 'react-router-dom': '^6.0.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('react-router');
    });

    it('detects tailwind feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['vite.config.ts'];
      ctx.packageJson = {
        dependencies: { react: '^18.0.0' },
        devDependencies: {
          '@vitejs/plugin-react': '^4.0.0',
          tailwindcss: '^3.0.0',
        },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('tailwind');
    });

    it('warns when no build script found', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { react: '^18.0.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('extracts node version from engines field', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { react: '^18.0.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.0.0' },
        engines: { node: '>=20.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.nodeVersion).toBe('20');
    });
  });

  describe('getEnvFileHints', () => {
    it('returns .env.example', () => {
      expect(service.getEnvFileHints()).toContain('.env.example');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates SPA Dockerfile with nginx', async () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { react: '^18.0.0' } };
      const detectionResult = {
        framework: FrameworkType.REACT_VITE,
        confidence: 100,
        buildMode: BuildMode.SPA,
        nodeVersion: '20',
        detectorName: 'react-vite-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('nginx:alpine');
      expect(plan.dockerfile).toContain('npm ci');
      expect(plan.networking.port).toBe(80);
      expect(plan.buildMode).toBe(BuildMode.SPA);
    });

    it('uses pnpm install when packageManager is pnpm', async () => {
      const ctx = baseContext();
      ctx.packageManager = 'pnpm';
      const detectionResult = {
        framework: FrameworkType.REACT_VITE,
        confidence: 100,
        nodeVersion: '20',
        detectorName: 'react-vite-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('pnpm install --frozen-lockfile');
    });

    it('uses port from fluiConfig if provided', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 8080 } };
      const detectionResult = {
        framework: FrameworkType.REACT_VITE,
        confidence: 100,
        nodeVersion: '20',
        detectorName: 'react-vite-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(8080);
    });
  });
});
