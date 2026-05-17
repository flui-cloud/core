import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CpuMetricsDto {
  @ApiProperty({ example: 45.2, description: 'CPU usage percentage' })
  usage_percent: number;

  @ApiProperty({ example: 4, description: 'Number of CPU cores' })
  cores?: number;
}

export class MemoryMetricsDto {
  @ApiProperty({ example: 8589934592, description: 'Total memory in bytes' })
  total_bytes: number;

  @ApiProperty({ example: 5368709120, description: 'Used memory in bytes' })
  used_bytes: number;

  @ApiProperty({
    example: 3221225472,
    description: 'Available memory in bytes',
  })
  available_bytes: number;

  @ApiProperty({ example: 62.5, description: 'Memory usage percentage' })
  usage_percent: number;
}

export class DiskMetricsDto {
  @ApiProperty({
    example: 85899345920,
    description: 'Total disk space in bytes',
  })
  total_bytes: number;

  @ApiProperty({
    example: 32749125632,
    description: 'Used disk space in bytes',
  })
  used_bytes: number;

  @ApiProperty({
    example: 53150220288,
    description: 'Available disk space in bytes',
  })
  available_bytes: number;

  @ApiProperty({ example: 38.1, description: 'Disk usage percentage' })
  usage_percent: number;
}

export class NetworkMetricsDto {
  @ApiProperty({ example: 123456789, description: 'Bytes received' })
  bytes_in?: number;

  @ApiProperty({ example: 987654321, description: 'Bytes transmitted' })
  bytes_out?: number;
}

export class SystemLoadDto {
  @ApiProperty({ example: 1.23, description: 'Load average over 1 minute' })
  load1: number;

  @ApiProperty({ example: 1.45, description: 'Load average over 5 minutes' })
  load5: number;

  @ApiProperty({ example: 1.67, description: 'Load average over 15 minutes' })
  load15: number;
}

export class SystemMetricsDto {
  @ApiProperty({
    type: SystemLoadDto,
    description: 'System load averages',
  })
  load: SystemLoadDto;

  @ApiProperty({
    example: 3456789,
    description: 'System uptime in seconds',
  })
  uptime_seconds: number;
}

/**
 * Metrics for a single server/node
 */
export class ServerMetricsDto {
  @ApiProperty({
    example: '10.0.1.5:9100',
    description: 'Prometheus instance address (host:port)',
  })
  instance: string;

  @ApiProperty({
    example: 'node-uuid-456',
    description: 'Server/Node ID from Prometheus labels',
    required: false,
  })
  server_id?: string;

  @ApiProperty({ type: CpuMetricsDto })
  cpu: CpuMetricsDto;

  @ApiProperty({ type: MemoryMetricsDto })
  memory: MemoryMetricsDto;

  @ApiProperty({ type: DiskMetricsDto })
  disk: DiskMetricsDto;

  @ApiProperty({ type: NetworkMetricsDto, required: false })
  network?: NetworkMetricsDto;

  @ApiProperty({ type: SystemMetricsDto, required: false })
  system?: SystemMetricsDto;
}

/**
 * Cluster Metrics Response DTO
 *
 * Returns metrics grouped per-server. Even when filtering by serverId,
 * the response uses the same array structure for consistency.
 */
export class ClusterMetricsResponseDto {
  @ApiProperty({
    example: 'cluster-uuid-123',
    description: 'Cluster ID',
  })
  cluster_id: string;

  @ApiProperty({
    example: '2026-02-08T10:30:00Z',
    description: 'Timestamp when the metrics were queried',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Metrics for each server/node in the cluster',
    type: [ServerMetricsDto],
  })
  servers: ServerMetricsDto[];
}

/**
 * Query DTO for metrics history range requests
 */
export class MetricsHistoryQueryDto {
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
 * A single time-series data point with all key metrics
 */
export class MetricsDataPointDto {
  @ApiProperty({ description: 'Unix timestamp', example: 1707350400 })
  timestamp: number;

  @ApiProperty({
    description: 'ISO 8601 formatted timestamp',
    example: '2026-02-08T10:00:00Z',
  })
  datetime: string;

  @ApiProperty({
    description: 'CPU usage percentage at this point',
    example: 45.2,
    required: false,
  })
  cpu_percent?: number;

  @ApiProperty({
    description: 'Memory usage percentage at this point',
    example: 62.5,
    required: false,
  })
  memory_percent?: number;

  @ApiProperty({
    description: 'Disk usage percentage at this point',
    example: 38.1,
    required: false,
  })
  disk_percent?: number;

  @ApiProperty({
    description: 'Network bytes received per second at this point',
    example: 123456,
    required: false,
  })
  network_in?: number;

  @ApiProperty({
    description: 'Network bytes transmitted per second at this point',
    example: 654321,
    required: false,
  })
  network_out?: number;
}

/**
 * Metrics history for a single server over a time range
 */
export class ServerMetricsHistoryDto {
  @ApiProperty({
    description: 'Prometheus instance address (host:port)',
    example: '10.0.1.5:9100',
  })
  instance: string;

  @ApiProperty({
    description: 'Server/Node ID from Prometheus labels',
    example: 'node-uuid-456',
    required: false,
  })
  server_id?: string;

  @ApiProperty({
    description: 'Time-series data points with metrics values',
    type: [MetricsDataPointDto],
  })
  data_points: MetricsDataPointDto[];
}

/**
 * Response DTO for cluster metrics history
 */
export class ClusterMetricsHistoryResponseDto {
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

  @ApiProperty({ description: 'Resolution step used', example: '60s' })
  step: string;

  @ApiProperty({
    description: 'Per-server metrics history with time-series data',
    type: [ServerMetricsHistoryDto],
  })
  servers: ServerMetricsHistoryDto[];

  @ApiProperty({
    description: 'ISO 8601 timestamp when the query was executed',
    example: '2026-02-08T10:30:00Z',
  })
  queried_at: string;
}
