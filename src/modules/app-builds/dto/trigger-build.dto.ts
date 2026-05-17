import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class TriggerBuildDto {
  @ApiPropertyOptional({
    description:
      'Cluster ID to run the build on. Defaults to the application cluster.',
    example: 'uuid-of-cluster',
  })
  @IsOptional()
  @IsUUID()
  buildClusterId?: string;

  @ApiPropertyOptional({
    description:
      'If true and the current HEAD commit was already built successfully, returns the existing build without queuing a new job.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skipIfSameCommit?: boolean;

  @ApiPropertyOptional({
    description:
      'If true, bypasses commit-SHA deduplication and BuildKit layer cache — always runs a full rebuild from scratch.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRebuild?: boolean;
}
