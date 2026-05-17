import { Test, TestingModule } from '@nestjs/testing';
import { ReactRouterDetectorService } from './react-router-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('ReactRouterDetectorService', () => {
  let service: ReactRouterDetectorService;

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
      providers: [ReactRouterDetectorService],
    }).compile();
    service = module.get<ReactRouterDetectorService>(
      ReactRouterDetectorService,
    );
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.REACT_ROUTER);
      expect(meta.priority).toBe(77);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when react-router.config.ts exists', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['react-router.config.ts'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when @react-router/dev in devDependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { devDependencies: { '@react-router/dev': '^7.0.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when react-router v7+ in dependencies', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { 'react-router': '^7.1.0' } };
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when react-router v6 (not v7)', () => {
      const ctx = baseContext();
      ctx.packageJson = { dependencies: { 'react-router': '^6.0.0' } };
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when no signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns SSR build mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['react-router.config.ts'];
      ctx.packageJson = { devDependencies: { '@react-router/dev': '^7.0.0' } };
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.SSR);
      expect(result.framework).toBe(FrameworkType.REACT_ROUTER);
    });

    it('detects file-routing feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['react-router.config.ts'];
      ctx.files = ['app/routes/_index.tsx'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('file-routing');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates SSR Dockerfile', async () => {
      const ctx = baseContext();
      const result = await service.generateBuildPlan(
        {
          framework: FrameworkType.REACT_ROUTER,
          confidence: 80,
          nodeVersion: '20',
          detectorName: 'react-router-detector',
        },
        ctx,
      );
      expect(result.dockerfile).toContain('"npm", "start"');
      expect(result.networking.port).toBe(3000);
    });
  });
});
