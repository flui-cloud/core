/**
 * Deployment lifecycle status
 */
export enum DeploymentStatus {
  // Initial states
  PENDING = 'pending',
  CLONING = 'cloning',
  DETECTING = 'detecting',

  // Build states
  PREPARING_BUILD = 'preparing-build',
  BUILDING = 'building',
  PUSHING = 'pushing',
  SCANNING = 'scanning',

  // Deploy states
  DEPLOYING = 'deploying',
  PROVISIONING = 'provisioning',
  WAITING_FOR_READY = 'waiting-for-ready',

  // Final states
  READY = 'ready',
  FAILED = 'failed',
  CANCELLED = 'cancelled',

  // Maintenance states
  PAUSED = 'paused',
  UPDATING = 'updating',
  DELETING = 'deleting',
  DELETED = 'deleted',
}
