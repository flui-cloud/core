import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PackageCacheEntryDto {
  @ApiProperty({
    example: 'pnpm',
    description:
      'Cache mount ID set by railpack — e.g. pnpm, maven, nuget, gradle, pip',
  })
  id: string;

  @ApiProperty({ example: '/root/.local/share/pnpm/store/v3' })
  mountPath: string;

  @ApiProperty({ example: 2231369728 })
  sizeBytes: number;

  @ApiProperty({ example: '2.1 GB' })
  humanSize: string;

  @ApiProperty()
  reclaimable: boolean;

  @ApiProperty({ example: '2 hours ago', nullable: true })
  lastUsed: string | null;
}

export class CacheLayerSummaryDto {
  @ApiProperty({ nullable: true, example: 11811160064 })
  sizeBytes: number | null;

  @ApiProperty({ nullable: true, example: '11.0 GB' })
  humanSize: string | null;
}

export class BuildCacheBreakdownResponseDto {
  @ApiProperty()
  clusterId: string;

  @ApiProperty({ nullable: true })
  scannedAt: Date | null;

  @ApiProperty({
    enum: ['ok', 'failed', 'skipped', 'pending', 'in_progress'],
    description:
      '"pending" = never scanned. "in_progress" = scan running now. ' +
      'Poll this endpoint until status is "ok" or "failed" after requesting a refresh.',
  })
  scanStatus: 'ok' | 'failed' | 'skipped' | 'pending' | 'in_progress';

  @ApiProperty({ nullable: true, example: 15032385536 })
  totalSizeBytes: number | null;

  @ApiProperty({ nullable: true, example: '14.0 GB' })
  totalHumanSize: string | null;

  @ApiProperty({
    type: CacheLayerSummaryDto,
    description: 'Image layer cache (Docker layer store)',
  })
  layers: CacheLayerSummaryDto;

  @ApiProperty({
    type: [PackageCacheEntryDto],
    description:
      'Per-framework package manager caches extracted from buildctl du --verbose',
  })
  packageCaches: PackageCacheEntryDto[];

  @ApiProperty({
    nullable: true,
    example: '4.0 GB',
    description: 'Sum of all package cache sizes',
  })
  packageCachesTotalHumanSize: string | null;
}

export class RefreshCacheBreakdownResponseDto {
  @ApiProperty({ enum: ['started', 'skipped'] })
  status: 'started' | 'skipped';

  @ApiPropertyOptional({
    example: 'build_in_progress',
    description:
      'Reason when status is "skipped": build_in_progress | scan_already_running | cluster_not_found',
  })
  reason?: string;
}
