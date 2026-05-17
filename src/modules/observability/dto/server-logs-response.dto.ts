import { ApiProperty } from '@nestjs/swagger';

export class LogEntryDto {
  @ApiProperty({
    example: '2025-01-18T10:30:45.123Z',
    description: 'Log timestamp',
  })
  timestamp: string;

  @ApiProperty({ example: 'system', description: 'Log component/source' })
  component?: string;

  @ApiProperty({ example: 'INFO', description: 'Log level' })
  level?: string;

  @ApiProperty({
    example: 'Service started successfully',
    description: 'Log message',
  })
  message: string;

  @ApiProperty({ description: 'Additional log metadata', required: false })
  metadata?: Record<string, any>;
}

/**
 * Server Logs Response DTO
 */
export class ServerLogsResponseDto {
  @ApiProperty({
    example: 'cluster-uuid-123',
    description: 'Cluster ID',
  })
  cluster_id: string;

  @ApiProperty({
    example: 'node-uuid-456',
    description:
      'Server/Node ID (optional, omitted if querying all cluster nodes)',
    required: false,
  })
  server_id?: string;

  @ApiProperty({ example: 150, description: 'Number of log entries returned' })
  count: number;

  @ApiProperty({ type: [LogEntryDto], description: 'Log entries' })
  logs: LogEntryDto[];

  @ApiProperty({
    example: '2025-01-18T10:35:00Z',
    description: 'Query execution timestamp',
  })
  queried_at: string;
}
