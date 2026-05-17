import { Test, TestingModule } from '@nestjs/testing';
import { StaticHtmlDetectorService } from './static-html-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('StaticHtmlDetectorService', () => {
  let service: StaticHtmlDetectorService;

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
      providers: [StaticHtmlDetectorService],
    }).compile();
    service = module.get<StaticHtmlDetectorService>(StaticHtmlDetectorService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.STATIC_HTML);
      expect(meta.priority).toBe(40);
      expect(meta.category).toBe('frontend');
    });
  });

  describe('canDetect', () => {
    it('returns true when index.html and no package.json or app code', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['index.html', 'style.css'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when package.json also present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['index.html', 'package.json'];
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when no index.html', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns STATIC build mode with 60+ confidence', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['index.html'];
      ctx.files = ['style.css', 'app.js'];
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.STATIC);
      expect(result.confidence).toBeGreaterThanOrEqual(60);
      expect(result.features).toContain('css');
      expect(result.features).toContain('javascript');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates simple nginx Dockerfile', async () => {
      const ctx = baseContext();
      const plan = await service.generateBuildPlan(
        {
          framework: FrameworkType.STATIC_HTML,
          confidence: 75,
          detectorName: 'static-html-detector',
        },
        ctx,
      );
      expect(plan.dockerfile).toContain('nginx:alpine');
      expect(plan.dockerfile).toContain('/usr/share/nginx/html');
      expect(plan.networking.port).toBe(80);
      expect(plan.resources.memory.request).toBe('32Mi');
    });
  });
});
