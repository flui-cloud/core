export enum BackupPolicyStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DEGRADED = 'degraded',
  FAILED = 'failed',
}

export enum BackupPolicyProfile {
  SINGLE = 'single',
  MIRRORED = 'mirrored',
  CUSTOM = 'custom',
}
