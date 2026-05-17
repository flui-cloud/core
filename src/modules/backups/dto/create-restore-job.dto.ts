import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RestoreTargetKind, RestoreStrategy } from '../enums/restore-job.enum';
import { RestoreTargetSelector } from '../entities/restore-job.entity';

export class CreateRestoreJobDto {
  @ApiProperty()
  @IsUUID()
  artifactId: string;

  @ApiProperty()
  @IsUUID()
  sourceDestinationId: string;

  @ApiProperty()
  @IsUUID()
  targetClusterId: string;

  @ApiProperty({ enum: RestoreTargetKind })
  @IsEnum(RestoreTargetKind)
  targetKind: RestoreTargetKind;

  @ApiPropertyOptional()
  @IsOptional()
  targetSelector?: RestoreTargetSelector;

  @ApiPropertyOptional({ enum: RestoreStrategy })
  @IsOptional()
  @IsEnum(RestoreStrategy)
  strategy?: RestoreStrategy;
}

export class RestorePreviewDto {
  @ApiProperty()
  @IsUUID()
  artifactId: string;

  @ApiProperty()
  @IsUUID()
  sourceDestinationId: string;
}
