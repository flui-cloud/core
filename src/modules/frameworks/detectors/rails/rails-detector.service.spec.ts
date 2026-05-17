import { Test, TestingModule } from '@nestjs/testing';
import { RailsDetectorService } from './rails-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('RailsDetectorService', () => {
  let service: RailsDetectorService;

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
      providers: [RailsDetectorService],
    }).compile();

    service = module.get<RailsDetectorService>(RailsDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.RAILS);
      expect(meta.displayName).toBe('Ruby on Rails');
      expect(meta.priority).toBe(64);
      expect(meta.category).toBe('fullstack');
    });
  });

  describe('canDetect', () => {
    it('returns true when Gemfile + config/application.rb present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      ctx.files = ['config/application.rb'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when Gemfile + bin/rails present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      ctx.files = ['bin/rails'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when only Gemfile present (no Rails signals)', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      expect(service.canDetect(ctx)).toBe(false);
    });

    it('returns false when no Gemfile', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns high confidence with full Rails structure', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile', 'Gemfile.lock'];
      ctx.files = [
        'config/application.rb',
        'config/routes.rb',
        'bin/rails',
        'app/controllers/application_controller.rb',
        'app/models/user.rb',
        'app/views/layouts/application.html.erb',
      ];
      const result = await service.detect(ctx);
      expect(result.confidence).toBe(100);
      expect(result.framework).toBe(FrameworkType.RAILS);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
      expect(result.features).toContain('mvc');
      expect(result.features).toContain('active-record');
      expect(result.features).toContain('erb-views');
    });

    it('detects api-only when no views directory', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      ctx.files = [
        'config/application.rb',
        'app/controllers/api/v1/users_controller.rb',
      ];
      const result = await service.detect(ctx);
      expect(result.features).toContain('api-only');
    });

    it('detects migrations feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      ctx.files = [
        'config/application.rb',
        'db/migrate/20240101_create_users.rb',
      ];
      const result = await service.detect(ctx);
      expect(result.features).toContain('migrations');
    });

    it('detects action-cable feature', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      ctx.files = [
        'config/application.rb',
        'app/channels/application_cable/channel.rb',
      ];
      const result = await service.detect(ctx);
      expect(result.features).toContain('action-cable');
    });

    it('warns when no Gemfile.lock present', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['Gemfile'];
      ctx.files = ['config/application.rb'];
      const result = await service.detect(ctx);
      expect(result.warnings.some((w) => w.includes('Gemfile.lock'))).toBe(
        true,
      );
    });
  });

  describe('generateBuildPlan', () => {
    it('generates ruby:3.3-slim Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.RAILS,
        confidence: 90,
        features: ['mvc', 'gemfile-lock'],
        metadata: { isApiOnly: false },
        detectorName: 'rails-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('ruby:3.3-slim');
      expect(plan.dockerfile).toContain('"bundle", "exec", "rails", "server"');
      expect(plan.networking.port).toBe(3000);
    });

    it('skips assets precompile for API-only apps', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.RAILS,
        confidence: 85,
        features: ['api-only'],
        metadata: { isApiOnly: true },
        detectorName: 'rails-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).not.toContain('assets:precompile');
    });

    it('includes assets precompile for full-stack apps', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.RAILS,
        confidence: 90,
        features: ['mvc', 'erb-views'],
        metadata: { isApiOnly: false },
        detectorName: 'rails-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('assets:precompile');
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 5000 } };
      const detectionResult = {
        framework: FrameworkType.RAILS,
        confidence: 90,
        features: [],
        metadata: { isApiOnly: true },
        detectorName: 'rails-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(5000);
    });
  });
});
