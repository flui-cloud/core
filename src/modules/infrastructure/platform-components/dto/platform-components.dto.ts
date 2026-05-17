import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PlatformComponentConditionDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  lastTransitionTime?: string;
}

export class PlatformComponentReplicaStatusDto {
  @ApiPropertyOptional()
  desired?: number;

  @ApiPropertyOptional()
  ready?: number;

  @ApiPropertyOptional()
  available?: number;

  @ApiPropertyOptional()
  unavailable?: number;

  @ApiPropertyOptional()
  updated?: number;
}

export class PlatformComponentPodIssueDto {
  @ApiProperty()
  podName: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  phase: string;

  @ApiPropertyOptional()
  containerName?: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  restartCount?: number;
}

export class PlatformComponentPodStatusDto {
  @ApiProperty()
  podName: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  phase: string;

  @ApiPropertyOptional()
  ready?: boolean;

  @ApiPropertyOptional()
  restartCount?: number;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  missing?: boolean;
}

export class PlatformComponentResourceStatusDto {
  @ApiProperty()
  kind: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  exists: boolean;

  @ApiProperty({ enum: ['healthy', 'degraded', 'missing'] })
  status: 'healthy' | 'degraded' | 'missing';

  @ApiProperty()
  restartSupported: boolean;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiPropertyOptional({ type: PlatformComponentReplicaStatusDto })
  replicas?: PlatformComponentReplicaStatusDto;

  @ApiPropertyOptional({ type: [PlatformComponentConditionDto] })
  conditions?: PlatformComponentConditionDto[];

  @ApiPropertyOptional({ type: [PlatformComponentPodIssueDto] })
  podIssues?: PlatformComponentPodIssueDto[];

  @ApiPropertyOptional({ type: [PlatformComponentPodStatusDto] })
  pods?: PlatformComponentPodStatusDto[];
}

export class PlatformComponentResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ enum: ['flui', 'k3s', 'addon'] })
  managedBy: 'flui' | 'k3s' | 'addon';

  @ApiProperty({ enum: ['healthy', 'degraded', 'missing'] })
  status: 'healthy' | 'degraded' | 'missing';

  @ApiProperty()
  restartSupported: boolean;

  @ApiProperty()
  errorCount: number;

  @ApiProperty({ type: [String] })
  errors: string[];

  @ApiProperty({ type: [PlatformComponentResourceStatusDto] })
  resources: PlatformComponentResourceStatusDto[];

  @ApiProperty()
  checkedAt: string;
}

export class RedeployPlatformComponentResponseDto {
  @ApiProperty()
  componentKey: string;

  @ApiProperty({ type: [String] })
  restartedResources: string[];

  @ApiProperty({ type: [String] })
  missingResources: string[];

  @ApiProperty({ type: [String] })
  skippedResources: string[];

  @ApiProperty({ enum: ['ok', 'partial', 'skipped'] })
  result: 'ok' | 'partial' | 'skipped';

  @ApiProperty()
  message: string;

  @ApiProperty()
  executedAt: string;
}

export class PlatformComponentLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Container name (optional if pod has a single container)',
  })
  @IsOptional()
  @IsString()
  container?: string;

  @ApiPropertyOptional({
    description: 'Number of log lines from the end of the stream',
    default: 200,
    minimum: 1,
    maximum: 2000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  tailLines?: number;
}

export class PlatformComponentLogsResponseDto {
  @ApiProperty()
  componentKey: string;

  @ApiProperty()
  podName: string;

  @ApiProperty()
  namespace: string;

  @ApiPropertyOptional()
  container?: string;

  @ApiProperty()
  tailLines: number;

  @ApiProperty()
  logs: string;
}
