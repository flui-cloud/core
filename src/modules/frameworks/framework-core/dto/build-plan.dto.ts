import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrameworkType, BuildMode, DeployStrategy } from '../enums';
import { EnvVarDetectionResultDto } from '../../env-var-detection/dto/env-var-detection.dto';

export class ResourceRequirementsDto {
  @ApiProperty()
  cpu: {
    request: string;
    limit: string;
  };

  @ApiProperty()
  memory: {
    request: string;
    limit: string;
  };
}

export class HealthCheckDto {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  path: string;

  @ApiProperty()
  port: number;

  @ApiPropertyOptional()
  initialDelaySeconds?: number;

  @ApiPropertyOptional()
  periodSeconds?: number;

  @ApiPropertyOptional()
  timeoutSeconds?: number;

  @ApiPropertyOptional()
  successThreshold?: number;

  @ApiPropertyOptional()
  failureThreshold?: number;
}

export class NetworkingDto {
  @ApiProperty()
  port: number;

  @ApiProperty({ enum: ['http', 'https'] })
  protocol: 'http' | 'https';

  @ApiPropertyOptional()
  ingressEnabled?: boolean;

  @ApiPropertyOptional()
  domain?: string;
}

export class ScalingDto {
  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  minReplicas: number;

  @ApiProperty()
  maxReplicas: number;

  @ApiPropertyOptional()
  targetCPUUtilization?: number;

  @ApiPropertyOptional()
  targetMemoryUtilization?: number;
}

export class BuildPlanMetadataDto {
  @ApiProperty()
  detectionConfidence: number;

  @ApiProperty()
  templateVersion: string;

  @ApiProperty()
  generatedAt: Date;

  @ApiPropertyOptional({ type: [String] })
  userOverrides?: string[];

  @ApiPropertyOptional({ type: [String] })
  warnings?: string[];
}

export class BuildPlanDto {
  @ApiProperty({ enum: FrameworkType })
  framework: FrameworkType;

  @ApiProperty()
  version: string;

  @ApiPropertyOptional({ enum: BuildMode })
  buildMode?: BuildMode;

  @ApiProperty({ description: 'Dockerfile content' })
  dockerfile: string;

  @ApiProperty({ description: 'Build context directory' })
  buildContext: string;

  @ApiPropertyOptional({ description: 'Docker build arguments' })
  buildArgs?: Record<string, string>;

  @ApiPropertyOptional({
    type: [Object],
    description: 'Build environment variables',
  })
  buildEnv?: Array<{ name: string; value: string }>;

  @ApiPropertyOptional({
    type: [Object],
    description: 'Runtime environment variables',
  })
  runtimeEnv?: Array<{ name: string; value: string }>;

  @ApiProperty({ type: ResourceRequirementsDto })
  resources: ResourceRequirementsDto;

  @ApiPropertyOptional({ type: HealthCheckDto })
  healthCheck?: HealthCheckDto;

  @ApiProperty({ type: NetworkingDto })
  networking: NetworkingDto;

  @ApiPropertyOptional({ type: ScalingDto })
  scaling?: ScalingDto;

  @ApiProperty({ type: BuildPlanMetadataDto })
  metadata: BuildPlanMetadataDto;

  @ApiPropertyOptional({
    type: EnvVarDetectionResultDto,
    description:
      'Detected environment variable suggestions from repository analysis. ' +
      'Always presented as suggestions — never enforced. ' +
      'Only populated for source code repos (GIT_BUILD / user Dockerfile).',
  })
  envVarSuggestions?: EnvVarDetectionResultDto;

  // ── Build Advisor fields ─────────────────────────────────────────────────

  @ApiProperty({
    enum: DeployStrategy,
    description: 'Recommended build strategy chosen by the build advisor',
  })
  deployStrategy: DeployStrategy;

  @ApiProperty({
    description:
      'Composite deployability score 0.0–1.0. Builds with score >= 0.82 proceed autonomously.',
  })
  deployabilityScore: number;

  @ApiProperty({ description: 'Breakdown of individual deployability factors' })
  deployabilityFactors: {
    frameworkRecognized: boolean;
    repoClarity: number;
    artifactPredictability: number;
    runtimePredictability: number;
    buildReproducibility: number;
  };

  @ApiPropertyOptional({
    description: 'Explicit build command for RAILPACK_WITH_OVERRIDES strategy',
  })
  suggestedBuildCommand?: string;

  @ApiPropertyOptional({
    description: 'Explicit start command for RAILPACK_WITH_OVERRIDES strategy',
  })
  suggestedStartCommand?: string;

  @ApiProperty({
    type: [String],
    description:
      'Human-readable warnings about project structure or deployment risks',
  })
  projectWarnings: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Actionable recommendations for NEEDS_ADJUSTMENT builds',
  })
  recommendedStructure?: string[];

  @ApiProperty({
    description:
      'When true, ambiguous choices require user confirmation before building',
  })
  requiresUserConfirmation: boolean;

  @ApiProperty({
    type: [Object],
    description:
      'Enumerable ambiguous choices requiring user selection. Empty when requiresUserConfirmation=false.',
  })
  userChoicesRequired: Array<{
    field: string;
    description: string;
    options: Array<{ label: string; value: string }>;
    suggestedIndex: number;
  }>;
}
