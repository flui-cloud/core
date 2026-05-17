import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthStatusDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Health status' })
  status: 'healthy' | 'unhealthy' | 'warning';

  @ApiProperty({ description: 'Response time in milliseconds' })
  responseTime: number;

  @ApiProperty({ description: 'Last check timestamp' })
  lastCheck: Date;

  @ApiPropertyOptional({ description: 'Error message if unhealthy' })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Additional health metrics' })
  metrics?: {
    apiCallsToday: number;
    errorRate: number;
    [key: string]: any;
  };
}
