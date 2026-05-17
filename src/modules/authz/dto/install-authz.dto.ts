import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstallAuthzDto {
  @ApiProperty({ description: 'Target workload cluster ID' })
  @IsUUID()
  clusterId: string;
}
