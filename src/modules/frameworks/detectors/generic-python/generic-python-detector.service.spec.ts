import { Test, TestingModule } from '@nestjs/testing';
import { GenericPythonDetectorService } from './generic-python-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('GenericPythonDetectorService', () => {
  let service: GenericPythonDetectorService;

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
      providers: [GenericPythonDetectorService],
    }).compile();
    service = module.get<GenericPythonDetectorService>(
      GenericPythonDetectorService,
    );
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.GENERIC_PYTHON);
      expect(meta.priority).toBe(25);
    });
  });

  describe('canDetect', () => {
    it('returns true when requirements.txt present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['requirements.txt'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when pyproject.toml present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['pyproject.toml'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when .py file in root', () => {
      const ctx = baseContext();
      ctx.files = ['app.py'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no python signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns confidence 25 (fallback)', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['requirements.txt'];
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(25);
      expect(result.framework).toBe(FrameworkType.GENERIC_PYTHON);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.features).toContain('requirements-txt');
    });

    it('warns when no dep file found', async () => {
      const ctx = baseContext();
      ctx.files = ['app.py'];
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('requirements.txt'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates python:3.12-slim Dockerfile', async () => {
      const ctx = baseContext();
      const plan = await service.generateBuildPlan(
        {
          framework: FrameworkType.GENERIC_PYTHON,
          confidence: 25,
          features: ['requirements-txt'],
          metadata: { entrypoint: 'main.py' },
          detectorName: 'generic-python-detector',
        },
        ctx,
      );
      expect(plan.dockerfile).toContain('python:3.12-slim');
      expect(plan.dockerfile).toContain('"python", "main.py"');
      expect(plan.networking.port).toBe(8000);
    });
  });
});
