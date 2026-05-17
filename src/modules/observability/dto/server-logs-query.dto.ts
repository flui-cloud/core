import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Server Logs Query DTO
 */
export class ServerLogsQueryDto {
  @ApiProperty({
    description: 'Number of log lines to return',
    example: 200,
    default: 200,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  tail?: number = 200;

  @ApiProperty({
    description: 'Filter logs by component',
    example: 'system',
    required: false,
  })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({
    description: 'Search query (case insensitive)',
    example: 'error',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Start time (ISO 8601)',
    example: '2025-01-18T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiProperty({
    description: 'End time (ISO 8601)',
    example: '2025-01-18T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  end?: string;
}
