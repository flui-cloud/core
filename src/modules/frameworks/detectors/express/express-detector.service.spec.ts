import { Test, TestingModule } from '@nestjs/testing';
import { ExpressDetectorService } from './express-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('ExpressDetectorService', () => {
  let service: ExpressDetectorService;

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
      providers: [ExpressDetectorService],
    }).compile();

    service = module.get<ExpressDetectorService>(ExpressDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.EXPRESS);
      expect(meta.displayName).toBe('Express.js');
      expect(meta.priority).toBe(55);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when express dep is present', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { express: '^4.18.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when @nestjs/core also present (NestJS takes priority)', () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { express: '^4.18.0', '@nestjs/core': '^10.0.0' },
      };
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when nuxt also present', () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { express: '^4.18.0', nuxt: '^3.0.0' },
      };
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when no express dep', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns confidence 90 with express + main + start + dev scripts', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { express: '^4.18.0' },
        main: 'index.js',
        scripts: { start: 'node index.js', dev: 'nodemon index.js' },
      };
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(90);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
    });

    it('detects cors feature', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { express: '^4.18.0', cors: '^2.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('cors');
    });

    it('detects auth feature from passport', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { express: '^4.18.0', passport: '^0.6.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('auth');
    });

    it('detects typescript feature', async () => {
      const ctx = baseContext();
      ctx.packageJson = {
        dependencies: { express: '^4.18.0' },
        devDependencies: { typescript: '^5.0.0' },
      };
      const result = await service.detect(ctx);
      expect(result.features).toContain('typescript');
    });

    it('warns when no start script', async () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { express: '^4.18.0' } };
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('start script'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates plain node Dockerfile for JS apps', async () => {
      const ctx = baseContext();
      ctx.packageJson = { main: 'server.js' };
      const detectionResult = {
        framework: FrameworkType.EXPRESS,
        confidence: 80,
        features: [],
        nodeVersion: '20',
        detectorName: 'express-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('"node", "server.js"');
      expect(plan.dockerfile).not.toContain('AS builder');
    });

    it('generates multi-stage Dockerfile for TypeScript apps', async () => {
      const ctx = baseContext();
      ctx.packageJson = { main: 'src/main.ts' };
      const detectionResult = {
        framework: FrameworkType.EXPRESS,
        confidence: 80,
        features: ['typescript'],
        nodeVersion: '20',
        detectorName: 'express-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('AS builder');
      expect(plan.dockerfile).toContain('dist/');
    });

    it('uses bun when packageManager is bun', async () => {
      const ctx = baseContext();
      ctx.packageManager = 'bun';
      const detectionResult = {
        framework: FrameworkType.EXPRESS,
        confidence: 80,
        features: [],
        nodeVersion: '20',
        detectorName: 'express-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('bun install --frozen-lockfile');
    });
  });
});
