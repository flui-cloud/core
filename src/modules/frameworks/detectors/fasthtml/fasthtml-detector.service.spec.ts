import { Test, TestingModule } from '@nestjs/testing';
import { FastHtmlDetectorService } from './fasthtml-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('FastHtmlDetectorService', () => {
  let service: FastHtmlDetectorService;

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
      providers: [FastHtmlDetectorService],
    }).compile();
    service = module.get<FastHtmlDetectorService>(FastHtmlDetectorService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.FASTHTML);
      expect(meta.priority).toBe(66);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when main.py + requirements.txt (no manage.py, no routers/)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when manage.py present (Django)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt', 'manage.py'];
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when routers/ present (FastAPI pattern)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      ctx.files = ['app/routers/users.py'];
      expect(service.canDetect(ctx)).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns PRODUCTION build mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.framework).toBe(FrameworkType.FASTHTML);
    });

    it('detects components feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      ctx.files = ['components.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('components');
    });

    it('detects static-assets feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      ctx.files = ['static/style.css'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('static-assets');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates uvicorn Dockerfile', async () => {
      const ctx = baseContext();
      const result = await service.generateBuildPlan(
        {
          framework: FrameworkType.FASTHTML,
          confidence: 70,
          features: ['requirements-txt'],
          detectorName: 'fasthtml-detector',
        },
        ctx,
      );
      expect(result.dockerfile).toContain('uvicorn');
      expect(result.dockerfile).toContain('main:app');
      expect(result.networking.port).toBe(8000);
    });
  });
});
