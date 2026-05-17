import { Test, TestingModule } from '@nestjs/testing';
import { AspNetCoreDetectorService } from './aspnet-core-detector.service';
import { IDetectionContext } from '../../framework-core/interfaces';
import { FrameworkType, BuildMode } from '../../framework-core/enums';

describe('AspNetCoreDetectorService', () => {
  let service: AspNetCoreDetectorService;

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
      providers: [AspNetCoreDetectorService],
    }).compile();

    service = module.get<AspNetCoreDetectorService>(AspNetCoreDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetadata', () => {
    it('returns correct metadata', () => {
      const meta = service.getMetadata();
      expect(meta.frameworkType).toBe(FrameworkType.ASPNET_CORE);
      expect(meta.displayName).toBe('ASP.NET Core');
      expect(meta.priority).toBe(59);
      expect(meta.category).toBe('backend');
    });
  });

  describe('canDetect', () => {
    it('returns true when .csproj file present', () => {
      const ctx = baseContext();
      ctx.files = ['MyApp.csproj'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when Program.cs in root', () => {
      const ctx = baseContext();
      ctx.files = ['Program.cs'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns true when global.json present', () => {
      const ctx = baseContext();
      ctx.rootFiles = ['global.json'];
      expect(service.canDetect(ctx)).toBe(true);
    });

    it('returns false when no .NET signals', () => {
      expect(service.canDetect(baseContext())).toBe(false);
    });
  });

  describe('detect', () => {
    it('returns high confidence with csproj + Program.cs + appsettings.json', async () => {
      const ctx = baseContext();
      ctx.rootFiles = ['appsettings.json'];
      ctx.files = ['MyApi.csproj', 'Program.cs'];
      const result = await service.detect(ctx);
      expect(result.confidence).toBeGreaterThanOrEqual(85);
      expect(result.framework).toBe(FrameworkType.ASPNET_CORE);
      expect(result.buildMode).toBe(BuildMode.PRODUCTION);
    });

    it('detects mvc-controllers feature', async () => {
      const ctx = baseContext();
      ctx.files = ['MyApi.csproj', 'Controllers/UsersController.cs'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('mvc-controllers');
    });

    it('detects ef-core feature from Migrations folder', async () => {
      const ctx = baseContext();
      ctx.files = ['MyApi.csproj', 'Migrations/20240101_Init.cs'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('ef-core');
    });

    it('detects razor feature from .razor files', async () => {
      const ctx = baseContext();
      ctx.files = ['MyApp.csproj', 'Pages/Index.razor'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('razor');
    });

    it('detects signalr feature from Hub class', async () => {
      const ctx = baseContext();
      ctx.files = ['MyApi.csproj', 'Hubs/ChatHub.cs'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('signalr');
    });

    it('detects grpc feature from .proto files', async () => {
      const ctx = baseContext();
      ctx.files = ['MyApi.csproj', 'Protos/greeter.proto'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('grpc');
    });

    it('detects solution feature from .sln file', async () => {
      const ctx = baseContext();
      ctx.files = ['MySolution.sln', 'src/MyApi/MyApi.csproj'];
      const result = await service.detect(ctx);
      expect(result.features).toContain('solution');
      expect(result.features).toContain('csproj');
    });

    it('extracts project name from csproj filename', async () => {
      const ctx = baseContext();
      ctx.files = ['TodoApi.csproj'];
      const result = await service.detect(ctx);
      expect(result.metadata.projectName).toBe('TodoApi');
    });
  });

  describe('generateBuildPlan', () => {
    it('generates multi-stage dotnet Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.ASPNET_CORE,
        confidence: 90,
        features: ['csproj'],
        metadata: { projectName: 'TodoApi', csprojFiles: ['TodoApi.csproj'] },
        detectorName: 'aspnet-core-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain(
        'mcr.microsoft.com/dotnet/sdk:8.0-alpine',
      );
      expect(plan.dockerfile).toContain('dotnet publish');
      expect(plan.dockerfile).toContain(
        'mcr.microsoft.com/dotnet/aspnet:8.0-alpine',
      );
      expect(plan.dockerfile).toContain('TodoApi.dll');
      expect(plan.networking.port).toBe(8080);
    });

    it('uses port from fluiConfig', async () => {
      const ctx = baseContext();
      ctx.fluiConfig = { version: '1.0', runtime: { port: 5000 } };
      const detectionResult = {
        framework: FrameworkType.ASPNET_CORE,
        confidence: 90,
        features: [],
        metadata: { projectName: 'App', csprojFiles: [] },
        detectorName: 'aspnet-core-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.networking.port).toBe(5000);
    });

    it('sets ASPNETCORE_URLS env in Dockerfile', async () => {
      const ctx = baseContext();
      const detectionResult = {
        framework: FrameworkType.ASPNET_CORE,
        confidence: 90,
        features: [],
        metadata: { projectName: 'App', csprojFiles: [] },
        detectorName: 'aspnet-core-detector',
      };
      const plan = await service.generateBuildPlan(detectionResult, ctx);
      expect(plan.dockerfile).toContain('ASPNETCORE_URLS=http://+:8080');
    });
  });
});
