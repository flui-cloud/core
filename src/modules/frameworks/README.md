# Framework Detection & Deployment System

This module provides automatic framework detection and deployment configuration for Flui.cloud applications.

## Architecture Overview

```
src/modules/frameworks/
├── framework-core/              # Core infrastructure
│   ├── interfaces/              # TypeScript interfaces
│   ├── enums/                   # Enums (FrameworkType, DeploymentStatus, etc.)
│   ├── dto/                     # Data Transfer Objects
│   ├── entities/                # TypeORM entities
│   ├── services/                # Core services
│   │   ├── framework-registry.service.ts
│   │   ├── confidence-scorer.service.ts
│   │   └── detection-orchestrator.service.ts
│   └── framework-core.module.ts
│
├── detectors/                   # Framework-specific detectors
│   ├── dockerfile/              # Dockerfile passthrough detector
│   ├── nextjs/                  # Next.js detector (TODO)
│   ├── angular/                 # Angular detector (TODO)
│   ├── nestjs/                  # NestJS detector (TODO)
│   └── ...                      # Future detectors
│
└── frameworks.module.ts         # Main module aggregator
```

## Core Concepts

### 1. Framework Detection

The system automatically detects the framework used in a repository through a multi-stage process:

1. **Context Preparation**: Scan repository structure, parse config files
2. **Detector Selection**: Run all capable detectors in parallel
3. **Confidence Scoring**: Calculate and compare confidence scores
4. **Best Match Selection**: Select detector with highest confidence
5. **Validation**: Ensure confidence meets threshold

### 2. Build Plan Generation

After detection, the system generates a complete build plan containing:

- Dockerfile (generated or user-provided)
- Build arguments and environment variables
- Resource requirements (CPU, memory)
- Health check configuration
- Networking and scaling parameters

### 3. Registry Pattern

All framework detectors register themselves with the `FrameworkRegistryService` on module initialization. This allows:

- Auto-discovery of detectors
- Priority-based execution
- Easy addition of new detectors

## Implementing a New Framework Detector

### Step 1: Create Detector Service

Create a new detector in `detectors/your-framework/`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IFrameworkDetector,
  IFrameworkMetadata,
  IDetectionContext,
  IDetectionResult,
  IBuildPlan,
} from '../../framework-core/interfaces';
import { FrameworkType } from '../../framework-core/enums';

@Injectable()
export class YourFrameworkDetectorService implements IFrameworkDetector {
  private readonly logger = new Logger(YourFrameworkDetectorService.name);

  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.YOUR_FRAMEWORK,
      displayName: 'Your Framework',
      detectorName: 'your-framework-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['1.x', '2.x'],
      priority: 50, // 0-100, higher runs first
      category: 'frontend', // or 'backend', 'fullstack', 'static'
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // Quick check - should be fast (<100ms)
    return context.rootFiles.includes('your-framework.config.js');
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    // Full detection logic
    let confidence = 0;

    if (context.rootFiles.includes('your-framework.config.js')) {
      confidence = 95;
    }

    if (context.packageJson?.dependencies?.['your-framework']) {
      confidence += 5;
    }

    return {
      framework: FrameworkType.YOUR_FRAMEWORK,
      confidence,
      version: this.extractVersion(context),
      detectorName: this.getMetadata().detectorName,
    };
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    // Generate Dockerfile and configuration
    const dockerfile = await this.generateDockerfile(context);

    return {
      framework: FrameworkType.YOUR_FRAMEWORK,
      version: detectionResult.version,
      dockerfile,
      buildContext: '.',
      resources: {
        cpu: { request: '500m', limit: '1000m' },
        memory: { request: '512Mi', limit: '1Gi' },
      },
      networking: {
        port: 3000,
        protocol: 'http',
      },
      metadata: {
        detectionConfidence: detectionResult.confidence,
        templateVersion: '1.0',
        generatedAt: new Date(),
      },
    };
  }

  private extractVersion(context: IDetectionContext): string {
    // Extract version from package.json or config
    return context.packageJson?.dependencies?.['your-framework'] || 'latest';
  }

  private async generateDockerfile(context: IDetectionContext): Promise<string> {
    // Generate Dockerfile content (could use templates)
    return `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
    `.trim();
  }
}
```

### Step 2: Create Detector Module

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { YourFrameworkDetectorService } from './your-framework-detector.service';
import { FrameworkCoreModule, FrameworkRegistryService } from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [YourFrameworkDetectorService],
  exports: [YourFrameworkDetectorService],
})
export class YourFrameworkDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: YourFrameworkDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
```

### Step 3: Register in FrameworksModule

Add your detector module to `frameworks.module.ts`:

```typescript
@Module({
  imports: [
    FrameworkCoreModule,
    DockerfileDetectorModule,
    YourFrameworkDetectorModule, // Add here
  ],
  exports: [FrameworkCoreModule],
})
export class FrameworksModule {}
```

### Step 4: Add FrameworkType Enum

Add your framework to `framework-core/enums/framework-type.enum.ts`:

```typescript
export enum FrameworkType {
  // ... existing types
  YOUR_FRAMEWORK = 'your-framework',
}
```

### Step 5: Write Tests

Create `your-framework-detector.service.spec.ts`:

```typescript
describe('YourFrameworkDetectorService', () => {
  let service: YourFrameworkDetectorService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [YourFrameworkDetectorService],
    }).compile();

    service = module.get(YourFrameworkDetectorService);
  });

  it('should detect your framework correctly', async () => {
    const context = {
      repositoryPath: '/test',
      rootFiles: ['your-framework.config.js'],
      files: [],
      lockfilePresent: true,
      hasCIConfig: false,
      hasTests: false,
    };

    const result = await service.detect(context);
    expect(result.confidence).toBeGreaterThan(80);
  });
});
```

## Confidence Scoring Guidelines

The `ConfidenceScorerService` adjusts base scores with penalties and boosts:

### Base Scores
- **100**: Dockerfile exists (passthrough)
- **95**: Framework config file present (e.g., `next.config.js`)
- **85**: Framework in package.json, no config file
- **50-70**: Generic patterns (e.g., only `express` in deps)
- **40**: Only static files, no clear framework

### Penalties (Applied by ConfidenceScorerService)
- **-10**: Missing dependencies
- **-15**: Unsupported framework version
- **-20**: Incompatible Node.js version
- **-30**: Monorepo without explicit config

### Boosts (Applied by ConfidenceScorerService)
- **+5**: `.nvmrc` present
- **+5**: Lockfile present
- **+10**: CI configuration present
- **+10**: Tests configured
- **+20**: Framework explicitly specified in `.flui.yaml`

### Confidence Thresholds
- **≥ 80%**: Auto-deploy (sufficient confidence)
- **50-79%**: Require user confirmation
- **< 50%**: Insufficient - request `.flui.yaml` or Dockerfile

## Template System (Future)

Templates will be stored in a separate repository for versioning:

```
framework-templates/
├── nextjs/
│   ├── metadata.yaml
│   └── versions/
│       ├── v13/
│       │   ├── template.yaml
│       │   ├── Dockerfile.ssr.hbs
│       │   └── Dockerfile.static.hbs
│       ├── v14/
│       └── v15/
├── angular/
└── ...
```

## Usage Example

### From Another Module

```typescript
import { DetectionOrchestratorService } from '@modules/frameworks';

@Injectable()
export class DeploymentService {
  constructor(
    private readonly detectionOrchestrator: DetectionOrchestratorService,
  ) {}

  async createDeployment(repositoryPath: string) {
    // Detect framework
    const detection = await this.detectionOrchestrator.detectFramework(
      repositoryPath,
    );

    if (!detection) {
      throw new Error('Could not detect framework');
    }

    // Get detector for framework
    const detector = this.registry.getDetector(detection.framework);

    // Generate build plan
    const buildPlan = await detector.generateBuildPlan(
      detection,
      context,
    );

    // Use buildPlan to build and deploy...
  }
}
```

## Testing

Run detector tests:

```bash
# All framework tests
npm run test -- frameworks

# Specific detector
npm run test -- dockerfile-detector

# With coverage
npm run test:cov -- frameworks
```

## Roadmap

### Phase 1 (Current)
- [x] Core infrastructure
- [x] Dockerfile passthrough detector
- [x] Documentation

### Phase 2 (Next)
- [ ] Next.js detector
- [ ] Angular detector
- [ ] NestJS detector
- [ ] Template system with Handlebars

### Phase 3 (Future)
- [ ] React + Vite detector
- [ ] Vue + Vite detector
- [ ] Express.js detector
- [ ] Static HTML detector
- [ ] Template repository (Git-based)
- [ ] Community detector marketplace

## Best Practices

1. **Keep canDetect() Fast**: Should return in <100ms
2. **Be Conservative**: Only return high confidence if very sure
3. **Provide Warnings**: Help users understand detection issues
4. **Test Thoroughly**: Cover edge cases and version compatibility
5. **Document Features**: Explain what framework features are supported
6. **Follow Patterns**: Look at existing detectors for guidance

## Contributing

To add a new framework detector:

1. Create detector service implementing `IFrameworkDetector`
2. Create detector module with auto-registration
3. Add to `FrameworksModule` imports
4. Write comprehensive tests
5. Update this README
6. Submit PR with:
   - Detector implementation
   - Tests (>90% coverage)
   - Documentation
   - Example `.flui.yaml` for the framework

## Support

For questions or issues:
- Check existing detectors for examples
- Read the framework detection design doc: `docs/framework-detection.md`
- Review `.flui.yaml` examples: `docs/flui-yaml-example.md`
