export enum BackupJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  UPLOADING = 'uploading',
  REPLICATING = 'replicating',
  PARTIALLY_COMPLETED = 'partially_completed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BackupJobTriggerType {
  SCHEDULED = 'scheduled',
  ON_DEMAND = 'on_demand',
  PRE_DEPLOY = 'pre_deploy',
}
