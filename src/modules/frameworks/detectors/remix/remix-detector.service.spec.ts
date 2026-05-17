import { Test, TestingModule } from '@nestjs/testing';
import { RemixDetectorService } from './remix-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('RemixDetectorService', () => {
  let service: RemixDetectorService;

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
      providers: [RemixDetectorService],
    }).compile();

    service = module.get<RemixDetectorService>(RemixDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.REMIX);
      expect(meta.displayName).toBe('Remix');
      expect(meta.priority).toBe(76);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when remix.config.js exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['remix.config.js'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @remix-run/node in dependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { '@remix-run/node': '^2.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @remix-run/dev in devDependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { devDependencies: { '@remix-run/dev': '^2.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no remix signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns SSR build mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['remix.config.js'];
      ctx.packageJson = {
        dependencies: {
          '@remix-run/node': '^2.0.0',
          '@remix-run/react': '^2.0.0',
        },
        devDependencies: { '@remix-run/dev': '^2.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.SSR);
      expect(result.framework).toBe(FrameworkType.REMIX);
    });

    it('detects file-routing from app/routes/', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['remix.config.js'];
      ctx.files = ['app/routes/_index.tsx', 'app/routes/about.tsx'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('file-routing');
    });

    it('detects prisma feature', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: {
          '@remix-run/node': '^2.0.0',
          '@prisma/client': '^5.0.0',
        },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('prisma');
    });

    it('detects tailwind feature', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { '@remix-run/node': '^2.0.0' },
        devDependencies: { tailwindcss: '^3.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('tailwind');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates SSR Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.REMIX,
        confidence: 80,
        buildMode: BuildMode.SSR,
        nodeVersion: '20',
        detectorName: 'remix-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('"npm", "start"');
      expect(plan.networking.port).toBe(3000);
      expect(plan.buildMode).toBe(BuildMode.SSR);
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 5000 } };
      const detectionResult = {
        framework: FrameworkType.REMIX,
        confidence: 80,
        nodeVersion: '20',
        detectorName: 'remix-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(5000);
    });
  });
});
