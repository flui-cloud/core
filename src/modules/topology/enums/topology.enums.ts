export enum TopologyAppCategory {
  DATABASE = 'database',
  CACHE = 'cache',
  STORAGE = 'storage',
  AUTOMATION = 'automation',
  MEDIA = 'media',
  MONITORING = 'monitoring',
  WEB = 'web',
  BUSINESS = 'business',
  INFRA = 'infra',
}

export enum TopologyAppKind {
  USER = 'user',
  SYSTEM = 'system',
}

export enum TopologyAppStatus {
  RUNNING = 'running',
  WARNING = 'warning',
  ERROR = 'error',
  STOPPED = 'stopped',
}

export enum TopologyServerRole {
  CONTROL_PLANE = 'control-plane',
  WORKER = 'worker',
}

export enum TopologyHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

export enum TopologyScalingMode {
  MANUAL = 'manual',
  HPA = 'hpa',
  DAEMONSET = 'daemonset',
  STATEFULSET = 'statefulset',
}

export enum TopologyEventType {
  APP_STATUS_CHANGED = 'app.status_changed',
  APP_SCALED = 'app.scaled',
  APP_DEPLOYED = 'app.deployed',
  APP_REMOVED = 'app.removed',
  SERVER_ADDED = 'server.added',
  SERVER_REMOVED = 'server.removed',
  HEARTBEAT = 'heartbeat',
}
