# Framework Detection System - Usage Examples

## For Application Developers

### Example 1: Zero-Config Deployment (Dockerfile Exists)

**Your Repository Structure**:
```
my-app/
├── Dockerfile
├── package.json
├── src/
│   └── index.ts
└── README.md
```

**Dockerfile**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**What Happens**:
1. System detects `Dockerfile` in root
2. Confidence: 100%
3. Extracts port from `EXPOSE 3000`
4. Uses Dockerfile as-is
5. Deploys automatically

**No configuration needed!** ✅

---

### Example 2: Override Port via .flui.yaml

**Your Repository**:
```
my-app/
├── Dockerfile
├── .flui.yaml        # ← Add this
└── src/
```

**`.flui.yaml`**:
```yaml
version: "1.0"

runtime:
  port: 8080  # Override EXPOSE directive
```

**What Happens**:
- System still uses your Dockerfile
- But deploys to port 8080 instead of 3000

---

### Example 3: Add Health Check

**`.flui.yaml`**:
```yaml
version: "1.0"

runtime:
  port: 3000
  healthCheck:
    enabled: true
    path: /health
    initialDelaySeconds: 30
    periodSeconds: 10
```

**Create Health Endpoint**:
```typescript
// src/health.controller.ts
@Controller()
export class HealthController {
  @Get('/health')
  health() {
    return { status: 'ok', timestamp: new Date() };
  }
}
```

**What Happens**:
- K8s will ping `/health` every 10 seconds
- Waits 30s after container starts
- Marks pod as ready when health check passes

---

### Example 4: Production Resources

**`.flui.yaml`**:
```yaml
version: "1.0"

resources:
  cpu:
    request: "1000m"  # Reserve 1 CPU core
    limit: "2000m"    # Max 2 CPU cores
  memory:
    request: "1Gi"    # Reserve 1GB RAM
    limit: "2Gi"      # Max 2GB RAM
```

**When to Use**:
- High-traffic applications
- Memory-intensive processing
- Prevent resource starvation

---

### Example 5: Auto-Scaling

**`.flui.yaml`**:
```yaml
version: "1.0"

scaling:
  enabled: true
  minReplicas: 2      # Always run at least 2 pods
  maxReplicas: 10     # Scale up to 10 pods max
  targetCPUUtilization: 70  # Scale when CPU > 70%
```

**What Happens**:
- Starts with 2 pods (high availability)
- Scales up when CPU usage > 70%
- Scales down when CPU usage < 70%
- Never exceeds 10 pods

---

### Example 6: Environment Variables

**`.flui.yaml`**:
```yaml
version: "1.0"

runtime:
  env:
    - name: NODE_ENV
      value: production
    - name: DATABASE_URL
      value: "${DATABASE_URL}"  # From Kubernetes secrets
    - name: API_URL
      value: "https://api.example.com"
```

**What Happens**:
- `NODE_ENV`: Hardcoded to "production"
- `DATABASE_URL`: Injected from K8s secret
- `API_URL`: Hardcoded to external API

---

### Example 7: Complete Production Setup

**`.flui.yaml`**:
```yaml
version: "1.0"

build:
  args:
    NODE_VERSION: "20"
  env:
    - name: BUILD_DATE
      value: "${CI_COMMIT_SHA}"

runtime:
  port: 3000
  protocol: https

  env:
    - name: NODE_ENV
      value: production
    - name: DATABASE_URL
      value: "${DATABASE_URL}"
    - name: REDIS_URL
      value: "${REDIS_URL}"
    - name: LOG_LEVEL
      value: info

  healthCheck:
    enabled: true
    path: /api/health
    port: 3000
    initialDelaySeconds: 45
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

resources:
  cpu:
    request: "1000m"
    limit: "2000m"
  memory:
    request: "1Gi"
    limit: "2Gi"

scaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilization: 75
  targetMemoryUtilization: 80
```

**When to Use**:
- Production applications
- High-availability requirements
- Auto-scaling needed
- Custom health checks

---

## For Framework Detector Developers

### Example 1: Using the Detection API

```typescript
import { Injectable } from '@nestjs/common';
import { DetectionOrchestratorService } from '@modules/frameworks';

@Injectable()
export class DeploymentService {
  constructor(
    private readonly orchestrator: DetectionOrchestratorService,
  ) {}

  async deployRepository(repositoryPath: string) {
    // Step 1: Detect framework
    const detection = await this.orchestrator.detectFramework(repositoryPath);

    if (!detection) {
      throw new Error('Could not detect framework');
    }

    console.log('Detected:', detection.framework);
    console.log('Confidence:', detection.confidence);
    console.log('Version:', detection.version);

    // Step 2: Check confidence
    if (detection.confidence < 80) {
      console.warn('Low confidence, requesting user confirmation');
      // Prompt user to confirm or provide .flui.yaml
    }

    // Step 3: Generate build plan
    const detector = this.registry.getDetector(detection.framework);
    const context = await this.prepareContext(repositoryPath);
    const buildPlan = await detector.generateBuildPlan(detection, context);

    console.log('Build Plan Generated:');
    console.log('- Dockerfile:', buildPlan.dockerfile.substring(0, 100) + '...');
    console.log('- Port:', buildPlan.networking.port);
    console.log('- Resources:', buildPlan.resources);

    // Step 4: Build and deploy
    await this.buildDockerImage(buildPlan);
    await this.deployToKubernetes(buildPlan);
  }
}
```

---

### Example 2: Implementing a Custom Detector

```typescript
import { Injectable } from '@nestjs/common';
import {
  IFrameworkDetector,
  IFrameworkMetadata,
  IDetectionContext,
  IDetectionResult,
  IBuildPlan,
} from '@modules/frameworks/framework-core';
import { FrameworkType } from '@modules/frameworks/framework-core/enums';

@Injectable()
export class ExpressDetectorService implements IFrameworkDetector {
  getMetadata(): IFrameworkMetadata {
    return {
      frameworkType: FrameworkType.EXPRESS,
      displayName: 'Express.js',
      detectorName: 'express-detector',
      detectorVersion: '1.0.0',
      supportedVersions: ['4.x'],
      priority: 60,
      category: 'backend',
      official: true,
    };
  }

  canDetect(context: IDetectionContext): boolean {
    // Quick check
    return !!context.packageJson?.dependencies?.['express'];
  }

  async detect(context: IDetectionContext): Promise<IDetectionResult> {
    let confidence = 0;

    // Has express dependency?
    if (context.packageJson?.dependencies?.['express']) {
      confidence = 80;
    }

    // Has typical Express files?
    const hasServer = context.files.some(f =>
      f.includes('server.js') || f.includes('app.js')
    );
    if (hasServer) {
      confidence += 10;
    }

    // Has routes directory?
    const hasRoutes = context.files.some(f => f.includes('routes/'));
    if (hasRoutes) {
      confidence += 5;
    }

    return {
      framework: FrameworkType.EXPRESS,
      confidence,
      version: context.packageJson?.dependencies?.['express'] || '4.x',
      detectorName: this.getMetadata().detectorName,
    };
  }

  async generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan> {
    // Generate Express-optimized Dockerfile
    const dockerfile = `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
    `.trim();

    return {
      framework: FrameworkType.EXPRESS,
      version: detectionResult.version,
      dockerfile,
      buildContext: '.',
      resources: {
        cpu: { request: '250m', limit: '500m' },
        memory: { request: '256Mi', limit: '512Mi' },
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
}
```

---

### Example 3: Testing Your Detector

```typescript
import { Test } from '@nestjs/testing';
import { ExpressDetectorService } from './express-detector.service';
import { IDetectionContext } from '@modules/frameworks/framework-core';

describe('ExpressDetectorService', () => {
  let detector: ExpressDetectorService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ExpressDetectorService],
    }).compile();

    detector = module.get(ExpressDetectorService);
  });

  it('should detect Express.js app', async () => {
    const context: IDetectionContext = {
      repositoryPath: '/test',
      rootFiles: ['package.json', 'server.js'],
      files: ['server.js', 'routes/users.js'],
      packageJson: {
        dependencies: {
          'express': '^4.18.0',
        },
      },
      lockfilePresent: true,
      hasCIConfig: false,
      hasTests: true,
    };

    const result = await detector.detect(context);

    expect(result.framework).toBe(FrameworkType.EXPRESS);
    expect(result.confidence).toBeGreaterThan(80);
  });

  it('should generate correct Dockerfile', async () => {
    const context = { /* ... */ };
    const detection = await detector.detect(context);
    const buildPlan = await detector.generateBuildPlan(detection, context);

    expect(buildPlan.dockerfile).toContain('FROM node:20-alpine');
    expect(buildPlan.dockerfile).toContain('npm ci --only=production');
    expect(buildPlan.networking.port).toBe(3000);
  });
});
```

---

### Example 4: Registering Your Detector

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { ExpressDetectorService } from './express-detector.service';
import { FrameworkCoreModule, FrameworkRegistryService } from '@modules/frameworks/framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [ExpressDetectorService],
  exports: [ExpressDetectorService],
})
export class ExpressDetectorModule implements OnModuleInit {
  constructor(
    private readonly detector: ExpressDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    // Auto-register on module initialization
    this.registry.registerDetector(this.detector);
  }
}
```

Then add to main module:

```typescript
@Module({
  imports: [
    FrameworkCoreModule,
    DockerfileDetectorModule,
    ExpressDetectorModule,  // ← Add here
  ],
})
export class FrameworksModule {}
```

---

## Common Patterns

### Pattern 1: Detecting Version from package.json

```typescript
private extractVersion(context: IDetectionContext): string {
  const version = context.packageJson?.dependencies?.['your-framework'];
  if (!version) return 'latest';

  // Extract major version: "^14.2.3" → "14"
  const match = version.match(/(\d+)/);
  return match ? match[1] : 'latest';
}
```

---

### Pattern 2: Detecting Build Output Directory

```typescript
private detectOutputDir(context: IDetectionContext): string {
  // Check framework config
  if (context.fluiConfig?.build?.outputDir) {
    return context.fluiConfig.build.outputDir;
  }

  // Check package.json scripts
  const buildScript = context.packageJson?.scripts?.build || '';
  if (buildScript.includes('--outDir dist')) {
    return 'dist';
  }

  // Default
  return 'dist';
}
```

---

### Pattern 3: Multi-Mode Detection (SSR vs Static)

```typescript
async detect(context: IDetectionContext): Promise<IDetectionResult> {
  let buildMode = BuildMode.SSR;

  // Check for static export in config
  if (context.files.includes('next.config.js')) {
    const configContent = await fs.readFile(
      path.join(context.repositoryPath, 'next.config.js'),
      'utf-8'
    );
    if (configContent.includes('output: "export"')) {
      buildMode = BuildMode.STATIC;
    }
  }

  return {
    framework: FrameworkType.NEXTJS,
    buildMode,
    // ... other fields
  };
}
```

---

### Pattern 4: Generating Dockerfile from Template

```typescript
async generateBuildPlan(
  detectionResult: IDetectionResult,
  context: IDetectionContext,
): Promise<IBuildPlan> {
  const dockerfile = detectionResult.buildMode === BuildMode.STATIC
    ? this.generateStaticDockerfile(context)
    : this.generateSSRDockerfile(context);

  return {
    framework: FrameworkType.NEXTJS,
    buildMode: detectionResult.buildMode,
    dockerfile,
    // ... other fields
  };
}

private generateSSRDockerfile(context: IDetectionContext): string {
  const nodeVersion = context.nodeVersion || '20';
  const packageManager = context.packageManager || 'npm';

  return `
FROM node:${nodeVersion}-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN ${packageManager} install --frozen-lockfile

FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${packageManager} run build

FROM node:${nodeVersion}-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
  `.trim();
}
```

---

## Debugging

### Enable Debug Logging

```typescript
// In your detector service
private readonly logger = new Logger(YourDetectorService.name);

async detect(context: IDetectionContext): Promise<IDetectionResult> {
  this.logger.debug('Starting detection');
  this.logger.debug(`Root files: ${context.rootFiles.join(', ')}`);

  // ... detection logic

  this.logger.log(`Confidence: ${confidence}`);
  return result;
}
```

### Test Detection Locally

```typescript
// Create a test script
const orchestrator = new DetectionOrchestratorService(registry, scorer);
const result = await orchestrator.detectFramework('/path/to/repo');

console.log('Detection Result:', {
  framework: result.framework,
  confidence: result.confidence,
  version: result.version,
  warnings: result.warnings,
});
```

---

## Best Practices

### ✅ DO
- Return high confidence only when very sure
- Provide helpful warnings
- Support user overrides via `.flui.yaml`
- Write comprehensive tests
- Document supported features
- Follow existing detector patterns

### ❌ DON'T
- Guess framework versions without evidence
- Return 100% confidence unless absolutely certain
- Ignore `.flui.yaml` user overrides
- Create complex detection logic in `canDetect()`
- Forget to handle missing files/configs gracefully
- Skip tests

---

## Resources

- **Main README**: [src/modules/frameworks/README.md](./README.md)
- **.flui.yaml Guide**: [docs/flui-yaml-example.md](../../docs/flui-yaml-example.md)
- **Implementation Summary**: [docs/framework-implementation-summary.md](../../docs/framework-implementation-summary.md)
- **Design Document**: [docs/framework-detection.md](../../docs/framework-detection.md)
