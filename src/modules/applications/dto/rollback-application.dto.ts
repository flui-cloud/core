import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RollbackApplicationDto {
  @ApiPropertyOptional({
    example: 2,
    description:
      'Target revision number to rollback to. Either revisionNumber or buildId must be provided.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  revisionNumber?: number;

  @ApiPropertyOptional({
    description:
      'ID of a build whose revision to rollback to. Either revisionNumber or buildId must be provided.',
  })
  @IsOptional()
  @IsUUID()
  buildId?: string;

  @ApiPropertyOptional({
    description: 'Reason for the rollback',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
