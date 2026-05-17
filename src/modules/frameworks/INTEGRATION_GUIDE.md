# Framework Detection System - Integration Guide

## Overview

This guide explains how to integrate the Framework Detection System with other modules in the Flui.cloud backend.

---

## Step 1: Import FrameworksModule

### In Your Module

```typescript
import { Module } from '@nestjs/common';
import { FrameworksModule } from '@modules/frameworks';

@Module({
  imports: [
    FrameworksModule,  // ← Import here
    // ... other modules
  ],
  // ... rest of module config
})
export class DeploymentsModule {}
```

---

## Step 2: Inject Services

### Example: Deployment Service

```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  DetectionOrchestratorService,
  FrameworkRegistryService,
} from '@modules/frameworks';

@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);

  constructor(
    private readonly orchestrator: DetectionOrchestratorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  async createDeployment(repositoryPath: string) {
    // Use detection services here
  }
}
```

---

## Step 3: Complete Deployment Flow

### Full Integration Example

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DetectionOrchestratorService,
  FrameworkRegistryService,
  DeploymentEntity,
  DeploymentStatus,
  BuildLogEntity,
  BuildLogLevel,
} from '@modules/frameworks';
import { GitService } from '@modules/git';

@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);

  constructor(
    private readonly orchestrator: DetectionOrchestratorService,
    private readonly registry: FrameworkRegistryService,
    private readonly gitService: GitService,
    @InjectRepository(DeploymentEntity)
    private readonly deploymentRepo: Repository<DeploymentEntity>,
    @InjectRepository(BuildLogEntity)
    private readonly buildLogRepo: Repository<BuildLogEntity>,
  ) {}

  /**
   * Create a new deployment from repository
   */
  async createDeployment(
    userId: string,
    repositoryId: string,
    branch: string = 'main',
  ): Promise<DeploymentEntity> {
    // Step 1: Create deployment entity (PENDING)
    const deployment = this.deploymentRepo.create({
      userId,
      repositoryId,
      branch,
      status: DeploymentStatus.PENDING,
      name: `deployment-${Date.now()}`,
    });
    await this.deploymentRepo.save(deployment);

    try {
      // Step 2: Clone repository
      await this.updateStatus(deployment, DeploymentStatus.CLONING);
      const repoPath = await this.gitService.cloneRepository(
        repositoryId,
        branch,
      );

      // Step 3: Detect framework
      await this.updateStatus(deployment, DeploymentStatus.DETECTING);
      const detection = await this.orchestrator.detectFramework(repoPath);

      if (!detection) {
        throw new Error('Could not detect framework');
      }

      // Update deployment with detection info
      deployment.framework = detection.framework;
      deployment.frameworkVersion = detection.version;
      deployment.buildMode = detection.buildMode;
      deployment.detectionConfidence = detection.confidence;
      deployment.warnings = detection.warnings;
      await this.deploymentRepo.save(deployment);

      // Log detection result
      await this.logBuild(
        deployment,
        BuildLogLevel.INFO,
        `Detected framework: ${detection.framework} (${detection.confidence}% confidence)`,
      );

      // Step 4: Generate build plan
      await this.updateStatus(deployment, DeploymentStatus.PREPARING_BUILD);
      const detector = this.registry.getDetector(detection.framework);
      const context = await this.orchestrator['prepareContext'](repoPath);
      const buildPlan = await detector.generateBuildPlan(detection, context);

      // Save build plan
      deployment.buildPlan = buildPlan as any;
      deployment.dockerfile = buildPlan.dockerfile;
      deployment.port = buildPlan.networking.port;
      deployment.env = buildPlan.runtimeEnv;
      deployment.resources = buildPlan.resources;
      deployment.scaling = buildPlan.scaling;
      await this.deploymentRepo.save(deployment);

      await this.logBuild(
        deployment,
        BuildLogLevel.INFO,
        'Build plan generated successfully',
      );

      // Step 5: Enqueue build job (Bull Queue)
      await this.enqueueBuild(deployment, buildPlan);

      return deployment;
    } catch (error) {
      // Handle errors
      await this.updateStatus(deployment, DeploymentStatus.FAILED);
      deployment.errorMessage = error.message;
      await this.deploymentRepo.save(deployment);

      await this.logBuild(
        deployment,
        BuildLogLevel.ERROR,
        `Deployment failed: ${error.message}`,
      );

      throw error;
    }
  }

  /**
   * Update deployment status
   */
  private async updateStatus(
    deployment: DeploymentEntity,
    status: DeploymentStatus,
  ): Promise<void> {
    deployment.status = status;
    await this.deploymentRepo.save(deployment);
    this.logger.log(`Deployment ${deployment.id}: ${status}`);
  }

  /**
   * Log build message
   */
  private async logBuild(
    deployment: DeploymentEntity,
    level: BuildLogLevel,
    message: string,
  ): Promise<void> {
    const log = this.buildLogRepo.create({
      deploymentId: deployment.id,
      level,
      message,
    });
    await this.buildLogRepo.save(log);
  }

  /**
   * Enqueue build job (placeholder)
   */
  private async enqueueBuild(
    deployment: DeploymentEntity,
    buildPlan: any,
  ): Promise<void> {
    // TODO: Add to Bull queue
    this.logger.log('Build job enqueued (not implemented yet)');
  }
}
```

---

## Step 4: Create Controller

### Deployment Controller Example

```typescript
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { DeploymentDto } from './dto/deployment.dto';

@ApiTags('Deployments')
@Controller('deployments')
export class DeploymentsController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new deployment' })
  @ApiResponse({ status: 201, type: DeploymentDto })
  async createDeployment(
    @Body() dto: CreateDeploymentDto,
  ): Promise<DeploymentDto> {
    const deployment = await this.deploymentService.createDeployment(
      dto.userId,
      dto.repositoryId,
      dto.branch,
    );

    return this.toDto(deployment);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deployment by ID' })
  @ApiResponse({ status: 200, type: DeploymentDto })
  async getDeployment(@Param('id') id: string): Promise<DeploymentDto> {
    const deployment = await this.deploymentService.findById(id);
    return this.toDto(deployment);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get deployment build logs' })
  async getBuildLogs(@Param('id') id: string) {
    return this.deploymentService.getBuildLogs(id);
  }

  private toDto(deployment: DeploymentEntity): DeploymentDto {
    return {
      id: deployment.id,
      userId: deployment.userId,
      repositoryId: deployment.repositoryId,
      status: deployment.status,
      framework: deployment.framework,
      frameworkVersion: deployment.frameworkVersion,
      buildMode: deployment.buildMode,
      detectionConfidence: deployment.detectionConfidence,
      url: deployment.url,
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
    };
  }
}
```

---

## Step 5: Create DTOs

### Create Deployment DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateDeploymentDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  repositoryId: string;

  @ApiProperty({ required: false, default: 'main' })
  @IsString()
  @IsOptional()
  branch?: string;
}
```

### Deployment Response DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { DeploymentStatus, FrameworkType, BuildMode } from '@modules/frameworks';

export class DeploymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  repositoryId: string;

  @ApiProperty({ enum: DeploymentStatus })
  status: DeploymentStatus;

  @ApiProperty({ enum: FrameworkType })
  framework: FrameworkType;

  @ApiProperty()
  frameworkVersion?: string;

  @ApiProperty({ enum: BuildMode })
  buildMode?: BuildMode;

  @ApiProperty()
  detectionConfidence?: number;

  @ApiProperty()
  url?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

---

## Step 6: Database Migrations

### Generate Migration

```bash
npm run typeorm -- migration:generate src/migrations/AddDeploymentEntities
```

### Run Migration

```bash
npm run migration:run
```

### Migration File Example

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeploymentEntities1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create deployments table
    await queryRunner.query(`
      CREATE TABLE "deployments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" varchar NOT NULL,
        "repositoryId" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "framework" varchar,
        "frameworkVersion" varchar(50),
        "buildMode" varchar,
        "detectionConfidence" float,
        "dockerfile" text,
        "buildPlan" jsonb,
        "imageTag" varchar(255),
        "domain" varchar(255),
        "url" varchar(500),
        "port" int,
        "env" jsonb,
        "resources" jsonb,
        "scaling" jsonb,
        "errorMessage" text,
        "warnings" jsonb,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE
      )
    `);

    // Create build_logs table
    await queryRunner.query(`
      CREATE TABLE "build_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "deploymentId" uuid NOT NULL,
        "level" varchar NOT NULL DEFAULT 'info',
        "message" text NOT NULL,
        "stage" varchar(100),
        "stepNumber" int,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_deployments_userId" ON "deployments" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_deployments_repositoryId" ON "deployments" ("repositoryId")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_build_logs_deploymentId" ON "build_logs" ("deploymentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "build_logs"`);
    await queryRunner.query(`DROP TABLE "deployments"`);
  }
}
```

---

## Step 7: Bull Queue Integration

### Add to Bull Queue Processor

```typescript
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeploymentEntity,
  DeploymentStatus,
  BuildLogEntity,
  BuildLogLevel,
} from '@modules/frameworks';

@Processor('deployment-build')
export class DeploymentBuildProcessor {
  private readonly logger = new Logger(DeploymentBuildProcessor.name);

  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deploymentRepo: Repository<DeploymentEntity>,
    @InjectRepository(BuildLogEntity)
    private readonly buildLogRepo: Repository<BuildLogEntity>,
  ) {}

  @Process('build-and-deploy')
  async handleBuildDeploy(job: Job<{ deploymentId: string }>) {
    const { deploymentId } = job.data;
    this.logger.log(`Processing build job for deployment: ${deploymentId}`);

    const deployment = await this.deploymentRepo.findOne({
      where: { id: deploymentId },
    });

    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    try {
      // Step 1: Build Docker image
      await this.updateStatus(deployment, DeploymentStatus.BUILDING);
      await this.logBuild(deployment, BuildLogLevel.INFO, 'Starting Docker build');

      const imageTag = await this.buildDockerImage(deployment);
      deployment.imageTag = imageTag;
      await this.deploymentRepo.save(deployment);

      // Step 2: Push to registry
      await this.updateStatus(deployment, DeploymentStatus.PUSHING);
      await this.logBuild(deployment, BuildLogLevel.INFO, 'Pushing image to registry');

      await this.pushImage(imageTag);

      // Step 3: Security scan
      await this.updateStatus(deployment, DeploymentStatus.SCANNING);
      await this.logBuild(deployment, BuildLogLevel.INFO, 'Scanning image for vulnerabilities');

      await this.scanImage(imageTag);

      // Step 4: Deploy to Kubernetes
      await this.updateStatus(deployment, DeploymentStatus.DEPLOYING);
      await this.logBuild(deployment, BuildLogLevel.INFO, 'Deploying to Kubernetes');

      await this.deployToK8s(deployment);

      // Step 5: Wait for ready
      await this.updateStatus(deployment, DeploymentStatus.WAITING_FOR_READY);
      await this.logBuild(deployment, BuildLogLevel.INFO, 'Waiting for deployment to be ready');

      await this.waitForReady(deployment);

      // Step 6: Complete
      await this.updateStatus(deployment, DeploymentStatus.READY);
      deployment.lastDeployedAt = new Date();
      await this.deploymentRepo.save(deployment);

      await this.logBuild(deployment, BuildLogLevel.INFO, '✅ Deployment successful');

      this.logger.log(`Deployment ${deploymentId} completed successfully`);
    } catch (error) {
      this.logger.error(`Deployment ${deploymentId} failed: ${error.message}`, error.stack);

      await this.updateStatus(deployment, DeploymentStatus.FAILED);
      deployment.errorMessage = error.message;
      await this.deploymentRepo.save(deployment);

      await this.logBuild(
        deployment,
        BuildLogLevel.ERROR,
        `❌ Deployment failed: ${error.message}`,
      );

      throw error;
    }
  }

  private async buildDockerImage(deployment: DeploymentEntity): Promise<string> {
    // TODO: Implement Docker build using BuildKit
    const imageTag = `flui/${deployment.name}:${deployment.commitSha || 'latest'}`;
    this.logger.log(`Building image: ${imageTag}`);
    return imageTag;
  }

  private async pushImage(imageTag: string): Promise<void> {
    // TODO: Implement image push to Harbor registry
    this.logger.log(`Pushing image: ${imageTag}`);
  }

  private async scanImage(imageTag: string): Promise<void> {
    // TODO: Implement Trivy security scan
    this.logger.log(`Scanning image: ${imageTag}`);
  }

  private async deployToK8s(deployment: DeploymentEntity): Promise<void> {
    // TODO: Generate and apply K8s manifests
    this.logger.log(`Deploying to K8s: ${deployment.id}`);
  }

  private async waitForReady(deployment: DeploymentEntity): Promise<void> {
    // TODO: Wait for K8s deployment rollout
    this.logger.log(`Waiting for ready: ${deployment.id}`);
  }

  private async updateStatus(
    deployment: DeploymentEntity,
    status: DeploymentStatus,
  ): Promise<void> {
    deployment.status = status;
    await this.deploymentRepo.save(deployment);
  }

  private async logBuild(
    deployment: DeploymentEntity,
    level: BuildLogLevel,
    message: string,
  ): Promise<void> {
    const log = this.buildLogRepo.create({
      deploymentId: deployment.id,
      level,
      message,
    });
    await this.buildLogRepo.save(log);
  }
}
```

---

## Step 8: WebSocket for Real-Time Updates

### WebSocket Gateway

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DeploymentStatus } from '@modules/frameworks';

@WebSocketGateway({ namespace: '/deployments' })
export class DeploymentGateway {
  @WebSocketServer()
  server: Server;

  emitStatusUpdate(deploymentId: string, status: DeploymentStatus) {
    this.server.to(deploymentId).emit('status-update', {
      deploymentId,
      status,
      timestamp: new Date(),
    });
  }

  emitBuildLog(deploymentId: string, log: string) {
    this.server.to(deploymentId).emit('build-log', {
      deploymentId,
      log,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('subscribe-deployment')
  handleSubscribe(client: any, deploymentId: string) {
    client.join(deploymentId);
    return { subscribed: true, deploymentId };
  }
}
```

---

## Complete Module Example

### DeploymentsModule

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { FrameworksModule, DeploymentEntity, BuildLogEntity } from '@modules/frameworks';
import { GitModule } from '@modules/git';
import { RepositoriesModule } from '@modules/repositories';
import { DeploymentsController } from './deployments.controller';
import { DeploymentService } from './deployment.service';
import { DeploymentBuildProcessor } from './deployment-build.processor';
import { DeploymentGateway } from './deployment.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeploymentEntity, BuildLogEntity]),
    BullModule.registerQueue({ name: 'deployment-build' }),
    FrameworksModule,  // ← Import framework detection
    GitModule,
    RepositoriesModule,
  ],
  controllers: [DeploymentsController],
  providers: [
    DeploymentService,
    DeploymentBuildProcessor,
    DeploymentGateway,
  ],
  exports: [DeploymentService],
})
export class DeploymentsModule {}
```

---

## Testing Integration

### Integration Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentService } from './deployment.service';
import { DetectionOrchestratorService, FrameworkRegistryService } from '@modules/frameworks';
import { GitService } from '@modules/git';

describe('DeploymentService Integration', () => {
  let service: DeploymentService;
  let orchestrator: DetectionOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeploymentService,
        // Mock dependencies
        {
          provide: DetectionOrchestratorService,
          useValue: {
            detectFramework: jest.fn().mockResolvedValue({
              framework: 'dockerfile',
              confidence: 100,
            }),
          },
        },
        // ... other mocks
      ],
    }).compile();

    service = module.get(DeploymentService);
    orchestrator = module.get(DetectionOrchestratorService);
  });

  it('should create deployment with framework detection', async () => {
    const deployment = await service.createDeployment('user-1', 'repo-1', 'main');

    expect(deployment.framework).toBe('dockerfile');
    expect(deployment.detectionConfidence).toBe(100);
    expect(orchestrator.detectFramework).toHaveBeenCalled();
  });
});
```

---

## Next Steps

1. ✅ Import `FrameworksModule` in your deployment module
2. ✅ Inject detection services in your deployment service
3. ✅ Implement deployment flow using detection + build plan
4. ✅ Create database migrations for deployment entities
5. ✅ Add Bull queue processor for async builds
6. ✅ Create WebSocket gateway for real-time updates
7. ✅ Write integration tests

---

## Support

For questions:
- Review this guide
- Check [README.md](./README.md) for detector implementation
- Review [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for code examples
- Check existing implementations in `src/modules/infrastructure/`
