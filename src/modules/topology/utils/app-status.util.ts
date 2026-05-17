import { TopologyAppStatus } from '../enums/topology.enums';

export interface PodStatusSummary {
  name: string;
  phase?: string;
  ready: boolean;
  waitingReason?: string;
  terminatedReason?: string;
  restartCount: number;
  pendingSinceMs?: number;
}

export interface AppStatusInputs {
  desiredReplicas: number;
  pods: PodStatusSummary[];
  hpaEnabled?: boolean;
  certExpiresInDays?: number;
  backupOverdue?: boolean;
}

export interface AppStatusResult {
  status: TopologyAppStatus;
  reason: string | null;
}

const FIVE_MIN_MS = 5 * 60 * 1000;
const ERROR_WAITING_REASONS = new Set([
  'CrashLoopBackOff',
  'ImagePullBackOff',
  'ErrImagePull',
  'CreateContainerConfigError',
  'InvalidImageName',
]);
const ERROR_TERMINATED_REASONS = new Set(['OOMKilled', 'Error']);

export function deriveAppStatus(input: AppStatusInputs): AppStatusResult {
  for (const pod of input.pods) {
    if (pod.waitingReason && ERROR_WAITING_REASONS.has(pod.waitingReason)) {
      return { status: TopologyAppStatus.ERROR, reason: pod.waitingReason };
    }
    if (
      pod.terminatedReason &&
      ERROR_TERMINATED_REASONS.has(pod.terminatedReason)
    ) {
      return { status: TopologyAppStatus.ERROR, reason: pod.terminatedReason };
    }
  }

  if (input.desiredReplicas === 0) {
    return { status: TopologyAppStatus.STOPPED, reason: null };
  }

  for (const pod of input.pods) {
    if (
      pod.phase === 'Pending' &&
      pod.pendingSinceMs !== undefined &&
      pod.pendingSinceMs > FIVE_MIN_MS
    ) {
      return { status: TopologyAppStatus.WARNING, reason: 'Pending >5 min' };
    }
    if (pod.restartCount > 3) {
      return {
        status: TopologyAppStatus.WARNING,
        reason: `${pod.restartCount} restarts in last hour`,
      };
    }
  }

  if (
    input.certExpiresInDays !== undefined &&
    input.certExpiresInDays >= 0 &&
    input.certExpiresInDays < 7
  ) {
    return {
      status: TopologyAppStatus.WARNING,
      reason: `Cert expiring in ${input.certExpiresInDays} day(s)`,
    };
  }
  if (input.backupOverdue) {
    return { status: TopologyAppStatus.WARNING, reason: 'Backup overdue' };
  }

  if (input.pods.length > 0 && input.pods.every((p) => p.ready)) {
    return { status: TopologyAppStatus.RUNNING, reason: null };
  }

  return { status: TopologyAppStatus.RUNNING, reason: null };
}
