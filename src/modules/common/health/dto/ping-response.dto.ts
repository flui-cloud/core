import { ApiProperty } from '@nestjs/swagger';

export class PingResponseDto {
  @ApiProperty({
    description: 'Health status of the API',
    example: 'ok',
    enum: ['ok'],
  })
  status: string;

  @ApiProperty({
    description: 'Current server timestamp',
    example: '2026-01-10T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Server uptime in seconds',
    example: 3600,
  })
  uptime: number;
}
