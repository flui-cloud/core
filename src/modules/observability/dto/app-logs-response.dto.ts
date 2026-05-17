import { ApiProperty } from '@nestjs/swagger';

/**
 * Structured log entry for an application pod log line.
 * All indexed Loki labels are surfaced as typed fields.
 */
export class AppLogEntryDto {
  @ApiProperty({ example: '2025-01-18T10:30:45.123Z' })
  timestamp: string;

  @ApiProperty({ example: 'error', required: false })
  level?: string;

  @ApiProperty({ example: 'Service crashed', description: 'Log message' })
  message: string;

  // Kubernetes labels
  @ApiProperty({ example: 'production', required: false })
  namespace?: string;

  @ApiProperty({ example: 'my-api', required: false })
  app?: string;

  @ApiProperty({ example: 'my-api-7d6b9f-xyz', required: false })
  pod?: string;

  @ApiProperty({ example: 'api', required: false })
  container?: string;

  @ApiProperty({ example: 'stderr', required: false })
  stream?: string;

  // Infrastructure labels
  @ApiProperty({ example: 'node-uuid', required: false })
  server_id?: string;

  @ApiProperty({ example: 'node-1', required: false })
  hostname?: string;

  @ApiProperty({ example: 'k3s-worker', required: false })
  server_type?: string;

  @ApiProperty({
    required: false,
    description: 'Raw parsed JSON metadata (if log line is JSON)',
  })
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Response for the application logs list endpoint.
 */
export class AppLogsResponseDto {
  @ApiProperty({ example: 'cluster-uuid-123' })
  cluster_id: string;

  @ApiProperty({ example: 'production', required: false })
  namespace?: string;

  @ApiProperty({ example: 'my-api', required: false })
  app?: string;

  @ApiProperty({ example: 150 })
  count: number;

  @ApiProperty({ type: [AppLogEntryDto] })
  logs: AppLogEntryDto[];

  @ApiProperty({ example: '2025-01-18T10:35:00Z' })
  queried_at: string;
}

/**
 * A single data point in the log volume time series.
 * Represents the count of log lines for a given level in a given time bucket.
 */
export class LogVolumeBucketDto {
  @ApiProperty({ example: 1737194400, description: 'Unix timestamp (seconds)' })
  timestamp: number;

  @ApiProperty({ example: '2025-01-18T10:00:00.000Z' })
  datetime: string;

  @ApiProperty({
    example: 42,
    description: 'Number of log lines in this bucket',
  })
  count: number;
}

/**
 * Time series of log volume for a single log level.
 */
export class LogVolumeLevelSeriesDto {
  @ApiProperty({
    example: 'error',
    description: 'Log level (e.g. info, warn, error)',
  })
  level: string;

  @ApiProperty({ type: [LogVolumeBucketDto] })
  series: LogVolumeBucketDto[];
}

/**
 * Response for the log volume (chart data) endpoint.
 */
export class AppLogVolumeResponseDto {
  @ApiProperty({ example: 'cluster-uuid-123' })
  cluster_id: string;

  @ApiProperty({ example: 'production', required: false })
  namespace?: string;

  @ApiProperty({ example: 'my-api', required: false })
  app?: string;

  @ApiProperty({ example: '2025-01-18T00:00:00Z' })
  range_start: string;

  @ApiProperty({ example: '2025-01-18T23:59:59Z' })
  range_end: string;

  @ApiProperty({ example: '5m', description: 'Bucket step size' })
  step: string;

  @ApiProperty({
    type: [LogVolumeLevelSeriesDto],
    description: 'One time series per log level',
  })
  series: LogVolumeLevelSeriesDto[];

  @ApiProperty({ example: '2025-01-18T10:35:00Z' })
  queried_at: string;
}
