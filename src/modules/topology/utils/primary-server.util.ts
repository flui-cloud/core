import { TopologyScalingMode } from '../enums/topology.enums';

export interface PodPlacement {
  podName: string;
  serverId: string;
  ordinal?: number;
  isLeader?: boolean;
}

export function resolvePrimaryServerId(
  pods: PodPlacement[],
  scalingMode: TopologyScalingMode,
  fallbackServerIds: string[],
): string | null {
  if (pods.length === 0) {
    if (fallbackServerIds.length === 0) return null;
    return [...fallbackServerIds].sort((a, b) => a.localeCompare(b))[0];
  }

  if (scalingMode === TopologyScalingMode.STATEFULSET) {
    const leader = pods.find((p) => p.isLeader);
    if (leader) return leader.serverId;
    const ordinalZero = pods.find((p) => p.ordinal === 0);
    if (ordinalZero) return ordinalZero.serverId;
  }

  const counts = new Map<string, number>();
  for (const pod of pods) {
    counts.set(pod.serverId, (counts.get(pod.serverId) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });

  return sorted[0][0];
}

export function statefulSetOrdinal(podName: string): number | undefined {
  const match = /-(\d+)$/.exec(podName);
  if (!match) return undefined;
  return Number.parseInt(match[1], 10);
}
