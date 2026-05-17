export enum DestinationRole {
  PRIMARY = 'primary',
  REPLICA = 'replica',
}

export enum ReplicationStatus {
  OK = 'ok',
  DEGRADED = 'degraded',
  FAILED = 'failed',
  NEVER_RUN = 'never_run',
}
