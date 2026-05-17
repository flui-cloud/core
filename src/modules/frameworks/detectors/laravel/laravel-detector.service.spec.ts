import { Test, TestingModule } from '@nestjs/testing';
import { LaravelDetectorService } from './laravel-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('LaravelDetectorService', () => {
  let service: LaravelDetectorService;

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
      providers: [LaravelDetectorService],
    }).compile();

    service = module.get<LaravelDetectorService>(LaravelDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.LARAVEL);
      expect(meta.displayName).toBe('Laravel');
      expect(meta.priority).toBe(61);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when artisan file is present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when artisan not present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['composer.json'];
      expect(service.canDetect(ctx)).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns high confidence with artisan + composer + Laravel structure', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan', 'composer.json', 'composer.lock'];
      ctx.files = [
        'bootstrap/app.php',
        'app/Http/Controllers/UserController.php',
        'app/Models/User.php',
        'database/migrations/2024_01_01_create_users_table.php',
        'routes/api.php',
        'routes/web.php',
        'resources/views/welcome.blade.php',
      ];
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.framework).toBe(FrameworkType.LARAVEL);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
    });

    it('detects artisan as primary signal', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan'];
      const result = await service.detect(ctx);
      expect(result.confidence).toBeGreaterThanOrEqual(70);
    });

    it('detects mvc feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan'];
      ctx.files = ['app/Http/Controllers/UserController.php'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('mvc');
    });

    it('detects eloquent feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan'];
      ctx.files = ['app/Models/Post.php'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('eloquent');
    });

    it('detects blade-templates feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan'];
      ctx.files = ['resources/views/home.blade.php'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('blade-templates');
    });

    it('detects queues feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan'];
      ctx.files = ['app/Jobs/SendEmailJob.php'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('queues');
    });

    it('detects vite feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan', 'vite.config.js'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('vite');
    });

    it('warns when no composer.lock found', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['artisan', 'composer.json'];
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('composer.lock'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates php-fpm Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.LARAVEL,
        confidence: 95,
        features: ['composer', 'mvc'],
        metadata: { hasVite: false },
        detectorName: 'laravel-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('php:8.3-fpm-alpine');
      expect(plan.dockerfile).toContain('composer install');
      expect(plan.networking.port).toBe(80);
    });

    it('includes node build step when vite detected', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.LARAVEL,
        confidence: 95,
        features: ['vite', 'composer'],
        metadata: { hasVite: true },
        detectorName: 'laravel-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('nodejs');
      expect(plan.dockerfile).toContain('npm run build');
    });

    it('uses custom port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 8080 } };
      const detectionResult = {
        framework: FrameworkType.LARAVEL,
        confidence: 95,
        features: [],
        metadata: { hasVite: false },
        detectorName: 'laravel-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(8080);
    });
  });
});
