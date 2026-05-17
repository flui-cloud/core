import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export type TargetCategory = 'SYSTEM' | 'APP';

/**
 * Health status for a single target (server/node)
 */
export class TargetHealthDto {
  @ApiProperty({
    description: 'Target instance address (host:port)',
    example: '10.0.1.5:9100',
  })
  instance: string;

  @ApiProperty({
    description: 'Server ID label from Prometheus',
    example: 'srv-abc123',
    required: false,
  })
  server_id?: string;

  @ApiProperty({
    description:
      'Target category. SYSTEM = control plane / platform components (counted in cluster status). APP = user workloads (informational only).',
    enum: ['SYSTEM', 'APP'],
    example: 'SYSTEM',
  })
  category: TargetCategory;

  @ApiProperty({
    description: 'Whether the target is reachable (Prometheus up metric)',
    example: true,
  })
  is_up: boolean;

  @ApiProperty({
    description:
      'True when no fresh scrape is available within the staleness window — value is from lookback memory, not a current observation. Stale targets are excluded from the cluster status calculation.',
    example: false,
  })
  is_stale: boolean;

  @ApiProperty({
    description: 'Unix timestamp of the last scrape',
    example: 1707350400,
  })
  last_scrape_timestamp: number;

  @ApiProperty({
    description: 'Seconds since last successful scrape',
    example: 8.5,
  })
  data_age_seconds: number;
}

/**
 * Aggregated cluster health summary
 */
export class ClusterHealthSummaryDto {
  @ApiProperty({
    description: 'Total number of monitored targets in the cluster',
    example: 3,
  })
  total_targets: number;

  @ApiProperty({
    description: 'Number of healthy (up) targets',
    example: 3,
  })
  healthy: number;

  @ApiProperty({
    description: 'Number of unhealthy (down) targets',
    example: 0,
  })
  unhealthy: number;

  @ApiProperty({
    description:
      'Number of targets excluded from the calculation because their last scrape is older than the staleness window',
    example: 0,
  })
  stale: number;
}

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';

/**
 * Response DTO for instant cluster health check
 */
export class ClusterHealthResponseDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: 'cluster-uuid-123',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Overall cluster health status',
    enum: ['HEALTHY', 'DEGRADED', 'DOWN', 'UNKNOWN'],
    example: 'HEALTHY',
  })
  status: HealthStatus;

  @ApiProperty({
    description: 'Aggregated health summary',
    type: ClusterHealthSummaryDto,
  })
  summary: ClusterHealthSummaryDto;

  @ApiProperty({
    description: 'Per-target health details',
    type: [TargetHealthDto],
  })
  targets: TargetHealthDto[];

  @ApiProperty({
    description: 'ISO 8601 timestamp when the health check was performed',
    example: '2026-02-08T10:30:00Z',
  })
  checked_at: string;
}

/**
 * Single data point in the health history timeline
 */
export class HealthHistoryPointDto {
  @ApiProperty({
    description: 'Unix timestamp of this data point',
    example: 1707350400,
  })
  timestamp: number;

  @ApiProperty({
    description: 'ISO 8601 formatted timestamp',
    example: '2026-02-08T10:00:00Z',
  })
  datetime: string;

  @ApiProperty({
    description: 'Value of the up metric (1 = up, 0 = down)',
    example: 1,
  })
  value: number;
}

/**
 * Health history for a single target over a time range
 */
export class TargetHealthHistoryDto {
  @ApiProperty({
    description: 'Target instance address (host:port)',
    example: '10.0.1.5:9100',
  })
  instance: string;

  @ApiProperty({
    description: 'Server ID label from Prometheus',
    example: 'srv-abc123',
    required: false,
  })
  server_id?: string;

  @ApiProperty({
    description: 'Uptime percentage over the queried range (0-100)',
    example: 99.8,
  })
  uptime_percent: number;

  @ApiProperty({
    description: 'Time-series data points for this target',
    type: [HealthHistoryPointDto],
  })
  data_points: HealthHistoryPointDto[];
}

/**
 * Query DTO for health history range requests
 */
export class ClusterHealthHistoryQueryDto {
  @ApiProperty({
    description: 'Start time in ISO 8601 format',
    example: '2026-02-08T00:00:00Z',
  })
  @IsString()
  start: string;

  @ApiProperty({
    description: 'End time in ISO 8601 format',
    example: '2026-02-08T23:59:59Z',
  })
  @IsString()
  end: string;

  @ApiProperty({
    description:
      'Resolution step for data points (Prometheus duration format, e.g. 60s, 5m, 1h)',
    example: '60s',
    required: false,
    default: '60s',
  })
  @IsOptional()
  @IsString()
  step?: string = '60s';
}

/**
 * Response DTO for historical cluster health
 */
export class ClusterHealthHistoryResponseDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: 'cluster-uuid-123',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Start of the queried time range (ISO 8601)',
    example: '2026-02-08T00:00:00Z',
  })
  range_start: string;

  @ApiProperty({
    description: 'End of the queried time range (ISO 8601)',
    example: '2026-02-08T23:59:59Z',
  })
  range_end: string;

  @ApiProperty({
    description: 'Resolution step used for the query',
    example: '60s',
  })
  step: string;

  @ApiProperty({
    description: 'Per-target health history with time-series data',
    type: [TargetHealthHistoryDto],
  })
  targets: TargetHealthHistoryDto[];

  @ApiProperty({
    description: 'ISO 8601 timestamp when the query was executed',
    example: '2026-02-08T10:30:00Z',
  })
  queried_at: string;
}
