import { Test, TestingModule } from '@nestjs/testing';
import { GenericNodeDetectorService } from './generic-node-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('GenericNodeDetectorService', () => {
  let service: GenericNodeDetectorService;

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
      providers: [GenericNodeDetectorService],
    }).compile();
    service = module.get<GenericNodeDetectorService>(
      GenericNodeDetectorService,
    );
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.GENERIC_NODE);
      expect(meta.priority).toBe(30);
    });
  });

  describe('canDetect', () => {
    it('returns true when package.json present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['package.json'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no package.json', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns confidence 30 (fallback)', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['package.json'];
      ctx.packageJson = {
        main: 'server.js',
        scripts: { start: 'node server.js' },
      };
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(30);
      expect(result.framework).toBe(FrameworkType.GENERIC_NODE);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.features).toContain('start-script');
      expect(result.features).toContain('main-entry');
    });

    it('warns when no start script', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['package.json'];
      ctx.packageJson = {};
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('start script'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates single-stage JS Dockerfile', async () => {
      const ctx = baseContext();
      const plan = await service.generateBuildPlan(
        {
          framework: FrameworkType.GENERIC_NODE,
          confidence: 30,
          features: [],
          metadata: { main: 'server.js' },
          nodeVersion: '20',
          detectorName: 'generic-node-detector',
        },
        ctx,
      );
      expect(plan.dockerfile).toContain('"node", "server.js"');
      expect(plan.dockerfile).not.toContain('AS builder');
    });

    it('generates multi-stage Dockerfile for TypeScript', async () => {
      const ctx = baseContext();
      const plan = await service.generateBuildPlan(
        {
          framework: FrameworkType.GENERIC_NODE,
          confidence: 30,
          features: ['typescript'],
          metadata: { main: 'main.ts' },
          nodeVersion: '20',
          detectorName: 'generic-node-detector',
        },
        ctx,
      );
      expect(plan.dockerfile).toContain('AS builder');
      expect(plan.dockerfile).toContain('dist/main.js');
    });
  });
});
