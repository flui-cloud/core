import { ApiProperty } from '@nestjs/swagger';

export class InstanceMetricsDto {
  @ApiProperty({ description: 'Timestamp of the metrics' })
  timestamp: Date;

  @ApiProperty({ description: 'CPU metrics' })
  cpu: {
    usage: number;
    cores: number;
  };

  @ApiProperty({ description: 'Memory metrics' })
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };

  @ApiProperty({ description: 'Disk metrics' })
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
    iops?: number;
  };

  @ApiProperty({ description: 'Network metrics' })
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn?: number;
    packetsOut?: number;
  };
}
