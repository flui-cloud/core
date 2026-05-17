import { Test, TestingModule } from '@nestjs/testing';
import { DjangoDetectorService } from './django-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('DjangoDetectorService', () => {
  let service: DjangoDetectorService;

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
      providers: [DjangoDetectorService],
    }).compile();

    service = module.get<DjangoDetectorService>(DjangoDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.DJANGO);
      expect(meta.displayName).toBe('Django');
      expect(meta.priority).toBe(65);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when manage.py is in rootFiles', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py', 'requirements.txt'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when settings.py found and requirements.txt present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['requirements.txt'];
      ctx.files = ['myapp/settings.py'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no django signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns high confidence with manage.py + settings.py + urls.py + wsgi.py', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py', 'requirements.txt'];
      ctx.files = ['myapp/settings.py', 'myapp/urls.py', 'myapp/wsgi.py'];
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.framework).toBe(FrameworkType.DJANGO);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
    });

    it('detects wsgi feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py'];
      ctx.files = ['config/wsgi.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('wsgi');
    });

    it('detects asgi feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py'];
      ctx.files = ['config/asgi.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('asgi');
    });

    it('detects celery feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py'];
      ctx.files = ['celery.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('celery');
    });

    it('detects requirements-txt feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py', 'requirements.txt'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('requirements-txt');
    });

    it('warns when no dependency file found', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['manage.py'];
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('requirements.txt'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates gunicorn-based Dockerfile for WSGI', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.DJANGO,
        confidence: 85,
        features: ['wsgi', 'requirements-txt'],
        detectorName: 'django-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('gunicorn');
      expect(plan.networking.port).toBe(8000);
    });

    it('generates uvicorn-based Dockerfile for ASGI', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.DJANGO,
        confidence: 85,
        features: ['asgi', 'requirements-txt'],
        detectorName: 'django-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('uvicorn');
    });

    it('uses pipenv install when pipenv feature detected', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.DJANGO,
        confidence: 85,
        features: ['pipenv'],
        detectorName: 'django-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('pipenv install');
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 9000 } };
      const detectionResult = {
        framework: FrameworkType.DJANGO,
        confidence: 85,
        features: [],
        detectorName: 'django-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(9000);
    });
  });
});
