import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Request DTOs ──────────────────────────────────────────────────────────────

export class ContainerResourceSpecDto {
  @ApiPropertyOptional({
    example: '500m',
    description: 'CPU quantity (e.g. "250m", "1", "2")',
  })
  @IsOptional()
  @IsString()
  cpu?: string;

  @ApiPropertyOptional({
    example: '256Mi',
    description: 'Memory quantity (e.g. "128Mi", "1Gi")',
  })
  @IsOptional()
  @IsString()
  memory?: string;
}

export class UpdateResourcesDto {
  @ApiPropertyOptional({
    type: ContainerResourceSpecDto,
    description: 'Resource requests (guaranteed minimums)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContainerResourceSpecDto)
  requests?: ContainerResourceSpecDto;

  @ApiPropertyOptional({
    type: ContainerResourceSpecDto,
    description: 'Resource limits (hard ceilings)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContainerResourceSpecDto)
  limits?: ContainerResourceSpecDto;

  @ApiPropertyOptional({
    example: 'app',
    description:
      'Name of the container to update. Defaults to the first container if omitted.',
  })
  @IsOptional()
  @IsString()
  containerName?: string;
}

export class UpdateReplicasDto {
  @ApiProperty({
    example: 2,
    minimum: 0,
    maximum: 20,
    description: 'Desired replica count (0 = stopped)',
  })
  @IsInt()
  @Min(0)
  @Max(20)
  replicas: number;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export class ContainerResourcesDto {
  @ApiPropertyOptional({ example: '500m' })
  cpu: string | null;

  @ApiPropertyOptional({ example: '256Mi' })
  memory: string | null;
}

export class ContainerRuntimeDetailDto {
  @ApiProperty({ example: 'app' })
  name: string;

  @ApiProperty({ example: 'nginx:1.25' })
  image: string;

  @ApiProperty({ type: ContainerResourcesDto })
  requests: ContainerResourcesDto;

  @ApiProperty({ type: ContainerResourcesDto })
  limits: ContainerResourcesDto;

  @ApiPropertyOptional({
    type: ContainerResourcesDto,
    description: 'Live usage from metrics-server (null if not available)',
  })
  usage?: ContainerResourcesDto;
}

export class ReplicaStatusDto {
  @ApiPropertyOptional({ example: 2 })
  desired?: number;

  @ApiPropertyOptional({ example: 2 })
  ready?: number;

  @ApiPropertyOptional({ example: 2 })
  available?: number;

  @ApiPropertyOptional({ example: 0 })
  unavailable?: number;

  @ApiPropertyOptional({ example: 2 })
  updated?: number;
}

export class AppRuntimeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  appId: string;

  @ApiProperty({ example: 'my-app' })
  deploymentName: string;

  @ApiProperty({ example: 'default' })
  namespace: string;

  @ApiProperty({ type: ReplicaStatusDto })
  replicas: ReplicaStatusDto;

  @ApiProperty({ type: [ContainerRuntimeDetailDto] })
  containers: ContainerRuntimeDetailDto[];
}
