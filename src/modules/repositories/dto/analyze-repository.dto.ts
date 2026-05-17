import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
  FrameworkType,
  BuildMode,
} from '../../frameworks/framework-core/enums';
import { EnvVarDetectionResultDto } from '../../frameworks/env-var-detection/dto/env-var-detection.dto';

/**
 * Request DTO for repository analysis
 */
export class AnalyzeRepositoryDto {
  @ApiPropertyOptional({
    description:
      'Branch name to analyze. Defaults to the repository default branch if not specified.',
    example: 'main',
  })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional({
    description: 'Specific commit SHA to analyze (optional)',
    example: 'a1b2c3d4',
  })
  @IsOptional()
  @IsString()
  commitSha?: string;
}

/**
 * Detection result DTO
 */
export class DetectionResultDto {
  @ApiProperty({
    description: 'Detected framework type',
    enum: FrameworkType,
    example: FrameworkType.NEXTJS,
  })
  @IsEnum(FrameworkType)
  framework: FrameworkType;

  @ApiProperty({
    description: 'Detection confidence score (0-100)',
    example: 95,
  })
  confidence: number;

  @ApiPropertyOptional({
    description: 'Framework version detected',
    example: '14.2.3',
  })
  version?: string;

  @ApiPropertyOptional({
    description: 'Major version for template selection',
    example: '14',
  })
  majorVersion?: string;

  @ApiPropertyOptional({
    description: 'Build mode detected',
    enum: BuildMode,
    example: BuildMode.PRODUCTION,
  })
  buildMode?: BuildMode;

  @ApiPropertyOptional({
    description: 'Detected features',
    type: [String],
    example: ['app-router', 'typescript', 'tailwind'],
  })
  features?: string[];

  @ApiPropertyOptional({
    description: 'Package manager detected',
    enum: ['npm', 'yarn', 'pnpm', 'bun'],
    example: 'pnpm',
  })
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  @ApiPropertyOptional({
    description: 'Node.js version requirement',
    example: '20.9.0',
  })
  nodeVersion?: string;

  @ApiPropertyOptional({
    description: 'Warnings found during detection',
    type: [String],
    example: ['No .nvmrc file found'],
  })
  warnings?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata from detector',
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Name of detector that produced this result',
    example: 'nextjs-detector',
  })
  detectorName: string;
}

/**
 * Resource configuration DTO
 */
export class ResourceConfigDto {
  @ApiProperty({
    description: 'CPU configuration',
    example: { request: '250m', limit: '500m' },
  })
  cpu: {
    request: string;
    limit: string;
  };

  @ApiProperty({
    description: 'Memory configuration',
    example: { request: '256Mi', limit: '512Mi' },
  })
  memory: {
    request: string;
    limit: string;
  };
}

/**
 * Health check configuration DTO
 */
export class HealthCheckConfigDto {
  @ApiProperty({
    description: 'Whether health check is enabled',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Health check path',
    example: '/health',
  })
  path: string;

  @ApiProperty({
    description: 'Health check port',
    example: 3000,
  })
  port: number;

  @ApiProperty({
    description: 'Initial delay before first health check (seconds)',
    example: 30,
  })
  initialDelaySeconds: number;

  @ApiProperty({
    description: 'Period between health checks (seconds)',
    example: 10,
  })
  periodSeconds: number;

  @ApiProperty({
    description: 'Health check timeout (seconds)',
    example: 5,
  })
  timeoutSeconds: number;

  @ApiProperty({
    description: 'Success threshold',
    example: 1,
  })
  successThreshold: number;

  @ApiProperty({
    description: 'Failure threshold',
    example: 3,
  })
  failureThreshold: number;
}

/**
 * Networking configuration DTO
 */
export class NetworkingConfigDto {
  @ApiProperty({
    description: 'Application port',
    example: 3000,
  })
  port: number;

  @ApiProperty({
    description: 'Protocol',
    enum: ['http', 'https'],
    example: 'http',
  })
  protocol: 'http' | 'https';

  @ApiPropertyOptional({
    description: 'Whether ingress is enabled',
    example: true,
  })
  ingressEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Custom domain',
    example: 'app.example.com',
  })
  domain?: string;
}

/**
 * Scaling configuration DTO
 */
export class ScalingConfigDto {
  @ApiProperty({
    description: 'Whether auto-scaling is enabled',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Minimum number of replicas',
    example: 2,
  })
  minReplicas: number;

  @ApiProperty({
    description: 'Maximum number of replicas',
    example: 5,
  })
  maxReplicas: number;

  @ApiPropertyOptional({
    description: 'Target CPU utilization percentage',
    example: 70,
  })
  targetCPUUtilization?: number;

  @ApiPropertyOptional({
    description: 'Target memory utilization percentage',
    example: 80,
  })
  targetMemoryUtilization?: number;
}

/**
 * Environment variable DTO
 */
export class EnvVarDto {
  @ApiProperty({
    description: 'Environment variable name',
    example: 'NODE_ENV',
  })
  name: string;

  @ApiProperty({
    description: 'Environment variable value',
    example: 'production',
  })
  value: string;
}

/**
 * Build plan metadata DTO
 */
export class BuildPlanMetadataDto {
  @ApiProperty({
    description: 'Detection confidence score',
    example: 95,
  })
  detectionConfidence: number;

  @ApiProperty({
    description: 'Template version used',
    example: 'nextjs-14',
  })
  templateVersion: string;

  @ApiProperty({
    description: 'Generation timestamp',
    example: '2025-11-01T10:00:00.000Z',
  })
  generatedAt: Date;

  @ApiPropertyOptional({
    description: 'User configuration overrides',
    type: [String],
  })
  userOverrides?: string[];

  @ApiPropertyOptional({
    description: 'Warnings',
    type: [String],
  })
  warnings?: string[];
}

/**
 * Build plan DTO
 */
export class BuildPlanDto {
  @ApiProperty({
    description: 'Framework type',
    enum: FrameworkType,
    example: FrameworkType.NEXTJS,
  })
  framework: FrameworkType;

  @ApiProperty({
    description: 'Framework version',
    example: '14.2.3',
  })
  version: string;

  @ApiPropertyOptional({
    description: 'Build mode',
    enum: BuildMode,
    example: BuildMode.PRODUCTION,
  })
  buildMode?: BuildMode;

  @ApiProperty({
    description: 'Generated Dockerfile content',
    example: 'FROM node:20-alpine...',
  })
  dockerfile: string;

  @ApiProperty({
    description: 'Build context directory',
    example: '.',
  })
  buildContext: string;

  @ApiPropertyOptional({
    description: 'Docker build arguments',
    example: { NODE_VERSION: '20' },
  })
  buildArgs?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Build-time environment variables',
    type: [EnvVarDto],
  })
  buildEnv?: EnvVarDto[];

  @ApiPropertyOptional({
    description: 'Runtime environment variables',
    type: [EnvVarDto],
  })
  runtimeEnv?: EnvVarDto[];

  @ApiProperty({
    description: 'Resource requirements',
    type: ResourceConfigDto,
  })
  resources: ResourceConfigDto;

  @ApiPropertyOptional({
    description: 'Health check configuration',
    type: HealthCheckConfigDto,
  })
  healthCheck?: HealthCheckConfigDto;

  @ApiProperty({
    description: 'Networking configuration',
    type: NetworkingConfigDto,
  })
  networking: NetworkingConfigDto;

  @ApiPropertyOptional({
    description: 'Scaling configuration',
    type: ScalingConfigDto,
  })
  scaling?: ScalingConfigDto;

  @ApiProperty({
    description: 'Build plan metadata',
    type: BuildPlanMetadataDto,
  })
  metadata: BuildPlanMetadataDto;

  @ApiPropertyOptional({
    type: EnvVarDetectionResultDto,
    description:
      'Detected environment variable suggestions from repository analysis. ' +
      'Always presented as suggestions — never enforced. ' +
      'Only populated for source code repos (GIT_BUILD / user Dockerfile).',
  })
  envVarSuggestions?: EnvVarDetectionResultDto;
}

/**
 * Deployability scores for the two available build paths
 */
export class BuildScoresDto {
  @ApiProperty({
    description:
      'GitHub Actions deployability score (0-100). Based on framework support matrix.',
    example: 95,
  })
  githubActions: number;

  @ApiProperty({
    description:
      'Railpack deployability score (0-100). Based on historical test suite results.',
    example: 45,
  })
  railpack: number;
}

export class DockerfileAnalysisDto {
  @ApiPropertyOptional({
    description: 'Port extracted from EXPOSE directive',
    example: 3000,
    nullable: true,
  })
  port: number | null;

  @ApiProperty({
    description:
      'Whether the Dockerfile contains #flui-managed marker in the first 2 lines',
    example: true,
  })
  isFluiManaged: boolean;

  @ApiPropertyOptional({
    description: 'Base runtime detected from the final FROM instruction',
    example: 'node',
    nullable: true,
  })
  baseRuntime: string | null;

  @ApiProperty({
    description:
      'Whether the Dockerfile uses multi-stage builds (multiple FROM instructions)',
    example: true,
  })
  hasMultiStage: boolean;
}

/**
 * Repository analysis response DTO
 */
export class RepositoryAnalysisDto {
  @ApiPropertyOptional({
    description: 'Repository ID. Null for public repository analysis.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  repositoryId?: string;

  @ApiProperty({
    description: 'Analyzed branch',
    example: 'main',
  })
  branch: string;

  @ApiProperty({
    description: 'Commit SHA analyzed',
    example: 'a1b2c3d4e5f6',
  })
  commitSha: string;

  @ApiProperty({
    description: 'Detection result',
    type: DetectionResultDto,
  })
  detection: DetectionResultDto;

  @ApiProperty({
    description: 'Generated build plan',
    type: BuildPlanDto,
  })
  buildPlan: BuildPlanDto;

  @ApiProperty({
    description: 'Deployability scores for each build path',
    type: BuildScoresDto,
  })
  scores: BuildScoresDto;

  @ApiProperty({
    description:
      'Recommended build path based on scores. Null if no framework detected.',
    enum: ['github-actions', 'railpack', 'dockerfile'],
    nullable: true,
    example: 'github-actions',
  })
  recommended: 'github-actions' | 'railpack' | 'dockerfile' | null;

  @ApiProperty({
    description:
      'Alternative framework candidates detected with confidence >= 50',
    type: [String],
    example: ['express', 'generic-node'],
  })
  alternatives: string[];

  @ApiProperty({
    description:
      'Whether the detected framework is supported by at least one build path',
    example: true,
  })
  supported: boolean;

  @ApiPropertyOptional({
    description:
      'Dockerfile analysis result (V3). Present only if a Dockerfile was found in the repo root.',
  })
  dockerfileAnalysis?: DockerfileAnalysisDto;

  @ApiProperty({
    description: 'Analysis timestamp',
    example: '2025-11-01T10:00:00.000Z',
  })
  analyzedAt: Date;
}
