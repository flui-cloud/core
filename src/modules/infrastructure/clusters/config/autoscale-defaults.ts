export interface AutoscaleThresholds {
  scaleUpMemoryPct: number;
  scaleUpCpuPct: number;
  warnMemoryPct: number;
  dangerMemoryPct: number;
  warnCpuPct: number;
  dangerCpuPct: number;
  cooldownSeconds: number;
  defaultMinNodes: number;
  defaultMaxNodes: number;
}

export const AUTOSCALE_DEFAULTS: AutoscaleThresholds = {
  scaleUpMemoryPct: 80,
  scaleUpCpuPct: 75,
  warnMemoryPct: 75,
  dangerMemoryPct: 90,
  warnCpuPct: 70,
  dangerCpuPct: 85,
  cooldownSeconds: 300,
  defaultMinNodes: 1,
  defaultMaxNodes: 3,
};
