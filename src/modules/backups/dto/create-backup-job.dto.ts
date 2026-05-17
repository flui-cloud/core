import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateBackupJobDto {
  @ApiProperty()
  @IsUUID()
  policyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
