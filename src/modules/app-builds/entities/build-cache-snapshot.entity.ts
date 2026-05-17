import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

export interface PackageCacheEntry {
  /** Cache mount ID set by railpack — e.g. "pnpm", "maven", "nuget", "gradle", "pip" */
  id: string;
  /** Mount target path inside the build container */
  mountPath: string;
  sizeBytes: number;
  /** Human-readable size — e.g. "2.1 GB" */
  humanSize: string;
  reclaimable: boolean;
  /** Raw "last accessed" string from buildctl du output — e.g. "2 hours ago" */
  lastUsed: string | null;
}

export type BuildCacheScanStatus = 'ok' | 'failed' | 'skipped' | 'pending';

/**
 * Stores the most recent BuildKit cache breakdown for a cluster.
 * One row per cluster (clusterId is the primary key).
 * Populated by BuildCacheInspectionService after each build when the queue is idle.
 */
@Entity('build_cache_snapshots')
export class BuildCacheSnapshotEntity {
  /** The cluster whose flui-build namespace cache this snapshot describes */
  @PrimaryColumn({ type: 'uuid' })
  clusterId: string;

  @Column({ type: 'bigint', nullable: true })
  totalSizeBytes: number | null;

  @Column({ type: 'bigint', nullable: true })
  layerSizeBytes: number | null;

  @Column({ type: 'bigint', nullable: true })
  packageCacheSizeBytes: number | null;

  /** Per-framework cache breakdown extracted from `buildctl du --verbose` */
  @Column({ type: 'json', nullable: true })
  packageCaches: PackageCacheEntry[] | null;

  /** When the last successful scan completed */
  @Column({ type: 'timestamptz', nullable: true })
  scannedAt: Date | null;

  /** How long the inspection job took in milliseconds */
  @Column({ nullable: true })
  scanDurationMs: number | null;

  /** True while an inspection job is running — used as a lightweight distributed lock */
  @Column({ default: false })
  scanInProgress: boolean;

  /** When the current/last scan started — used to detect stale locks (> 10 min) */
  @Column({ type: 'timestamptz', nullable: true })
  scanStartedAt: Date | null;

  @Column({ default: 'pending' })
  lastScanStatus: BuildCacheScanStatus;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
