export enum DestinationHealthStatus {
  UNKNOWN = 'unknown',
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  FAILED = 'failed',
}

export enum EncryptionMode {
  FLUI_MANAGED = 'flui_managed',
  BYO_PASSPHRASE = 'byo_passphrase',
  NONE = 'none',
}
