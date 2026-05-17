import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AutoscaleWarningLevel {
  NONE = 'NONE',
  WARN_NEEDS_AUTOSCALE = 'WARN_NEEDS_AUTOSCALE',
  DANGER_NEEDS_SCALE = 'DANGER_NEEDS_SCALE',
}

export class AutoscaleEffectiveThresholdsDto {
  @ApiProperty() scaleUpMemoryPct: number;
  @ApiProperty() scaleUpCpuPct: number;
  @ApiProperty() warnMemoryPct: number;
  @ApiProperty() dangerMemoryPct: number;
  @ApiProperty() warnCpuPct: number;
  @ApiProperty() dangerCpuPct: number;
  @ApiProperty() cooldownSeconds: number;
}

export class AutoscaleMetricsDto {
  @ApiPropertyOptional({ nullable: true })
  memoryPct: number | null;

  @ApiPropertyOptional({ nullable: true })
  cpuPct: number | null;
}

export class AutoscaleStatusDto {
  @ApiProperty() clusterId: string;
  @ApiProperty() autoscalingEnabled: boolean;
  @ApiPropertyOptional() minNodes?: number;
  @ApiPropertyOptional() maxNodes?: number;
  @ApiProperty() currentNodes: number;
  @ApiProperty({ type: AutoscaleMetricsDto }) metrics: AutoscaleMetricsDto;
  @ApiProperty({ enum: AutoscaleWarningLevel }) warning: AutoscaleWarningLevel;
  @ApiProperty() warningMessage: string | null;
  @ApiProperty({ type: AutoscaleEffectiveThresholdsDto })
  effectiveThresholds: AutoscaleEffectiveThresholdsDto;
}

export class AutoscaleDefaultsDto {
  @ApiProperty() scaleUpMemoryPct: number;
  @ApiProperty() scaleUpCpuPct: number;
  @ApiProperty() warnMemoryPct: number;
  @ApiProperty() dangerMemoryPct: number;
  @ApiProperty() warnCpuPct: number;
  @ApiProperty() dangerCpuPct: number;
  @ApiProperty() cooldownSeconds: number;
  @ApiProperty() defaultMinNodes: number;
  @ApiProperty() defaultMaxNodes: number;
}
