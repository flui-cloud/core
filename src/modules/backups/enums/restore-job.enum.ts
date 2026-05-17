export enum RestoreJobStatus {
  PENDING = 'pending',
  PREVIEWING = 'previewing',
  RESTORING = 'restoring',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum RestoreTargetKind {
  CLUSTER = 'cluster',
  NAMESPACE = 'namespace',
  APPLICATION = 'application',
  OBSERVABILITY = 'observability',
}

export enum RestoreStrategy {
  VELERO_REBUILD = 'velero_rebuild',
  OS_SNAPSHOT = 'os_snapshot',
}

export enum PreDeploySnapshotPolicy {
  REQUIRED = 'required',
  BEST_EFFORT = 'best_effort',
}
