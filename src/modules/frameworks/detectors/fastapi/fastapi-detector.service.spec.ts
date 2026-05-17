import { Test, TestingModule } from '@nestjs/testing';
import { FastApiDetectorService } from './fastapi-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('FastApiDetectorService', () => {
  let service: FastApiDetectorService;

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
      providers: [FastApiDetectorService],
    }).compile();

    service = module.get<FastApiDetectorService>(FastApiDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.FASTAPI);
      expect(meta.displayName).toBe('FastAPI');
      expect(meta.priority).toBe(67);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when main.py + requirements.txt present (no manage.py)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when app/main.py in files + pyproject.toml', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pyproject.toml'];
      ctx.files = ['app/main.py'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when manage.py present (Django)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt', 'manage.py'];
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
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      const result = await service.detect(ctx);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.framework).toBe(FrameworkType.FASTAPI);
    });

    it('detects routers feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      ctx.files = ['app/routers/users.py', 'app/routers/items.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('routers');
    });

    it('detects alembic feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      ctx.files = ['alembic.ini', 'alembic/env.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('alembic');
    });

    it('detects pydantic-models feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['main.py', 'requirements.txt'];
      ctx.files = ['app/schemas.py'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('pydantic-models');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates uvicorn-based Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.FASTAPI,
        confidence: 75,
        features: ['requirements-txt'],
        detectorName: 'fastapi-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('uvicorn');
      expect(plan.dockerfile).toContain('main:app');
      expect(plan.networking.port).toBe(8000);
    });

    it('uses pip install . for pyproject', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.FASTAPI,
        confidence: 75,
        features: ['pyproject'],
        detectorName: 'fastapi-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('pip install .');
    });

    it('uses custom port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 8080 } };
      const detectionResult = {
        framework: FrameworkType.FASTAPI,
        confidence: 75,
        features: [],
        detectorName: 'fastapi-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(8080);
    });
  });
});
