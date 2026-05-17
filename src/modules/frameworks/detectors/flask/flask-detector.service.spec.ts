import { Test, TestingModule } from '@nestjs/testing';
import { FlaskDetectorService } from './flask-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('FlaskDetectorService', () => {
  let service: FlaskDetectorService;

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
      providers: [FlaskDetectorService],
    }).compile();

    service = module.get<FlaskDetectorService>(FlaskDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.FLASK);
      expect(meta.displayName).toBe('Flask');
      expect(meta.priority).toBe(60);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when app.py + requirements.txt present (no manage.py or main.py)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py', 'requirements.txt'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when wsgi.py + Pipfile present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['wsgi.py', 'Pipfile'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when manage.py present (Django)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py', 'requirements.txt', 'manage.py'];
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when main.py present (FastAPI)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py', 'requirements.txt', 'main.py'];
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when no python entry file', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['requirements.txt'];
      expect(service.canDetect(ctx)).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns PRODUCTION build mode', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py', 'requirements.txt'];
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.framework).toBe(FrameworkType.FLASK);
    });

    it('detects blueprints feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py', 'requirements.txt'];
      ctx.files = ['app/blueprints/auth.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('blueprints');
    });

    it('detects flask-migrate feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py', 'requirements.txt'];
      ctx.files = ['migrations/env.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('flask-migrate');
    });

    it('detects wsgi feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['wsgi.py', 'requirements.txt'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('wsgi');
    });

    it('warns when no dependency file found', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['app.py'];
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('requirements.txt'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates gunicorn Dockerfile with app:app entrypoint', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.FLASK,
        confidence: 70,
        features: ['requirements-txt'],
        metadata: { entrypoint: 'app.py' },
        detectorName: 'flask-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('gunicorn');
      expect(plan.dockerfile).toContain('app:app');
      expect(plan.networking.port).toBe(5000);
    });

    it('uses application:app for application.py entrypoint', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.FLASK,
        confidence: 70,
        features: ['requirements-txt'],
        metadata: { entrypoint: 'application.py' },
        detectorName: 'flask-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('application:app');
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 7000 } };
      const detectionResult = {
        framework: FrameworkType.FLASK,
        confidence: 70,
        features: [],
        detectorName: 'flask-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(7000);
    });
  });
});
