import { Injectable, Logger } from '@nestjs/common';
import { PrometheusQueryService } from './prometheus-query.service';
import { PrometheusQueryResult } from '../interfaces/prometheus-response.interface';
import {
  HealthStatus,
  ClusterHealthResponseDto,
  ClusterHealthHistoryResponseDto,
  TargetHealthDto,
  TargetHealthHistoryDto,
  HealthHistoryPointDto,
  TargetCategory,
} from '../dto';

const SYSTEM_NAMESPACES: ReadonlySet<string> = new Set([
  'kube-system',
  'flui-system',
  'flui-observability',
  'flui-build',
  'cert-manager',
]);

const SYSTEM_JOBS: ReadonlySet<string> = new Set([
  'kubernetes-nodes',
  'kubernetes-cadvisor',
  'node-exporter',
  'kube-state-metrics',
  'flui-servers',
  'flui-k3s-nodes',
  'flui-k3s-kubelet',
]);

const STALE_THRESHOLD_SECONDS = 90;

const DOWN_THRESHOLD = 0.5;

@Injectable()
export class ClusterHealthService {
  private readonly logger = new Logger(ClusterHealthService.name);

  constructor(private readonly prometheusQuery: PrometheusQueryService) {}

  /**
   * Get instant health status for a cluster (or a specific server within it).
   * Status reflects only system targets (control plane + platform components);
   * user app targets are reported but do not affect the status.
   */
  async getInstantHealth(
    clusterId: string,
    serverId?: string,
  ): Promise<ClusterHealthResponseDto> {
    const results = await this.prometheusQuery.getClusterTargetsHealth(
      clusterId,
      serverId,
    );

    const now = Date.now() / 1000;
    const targets: TargetHealthDto[] = results.map((result) =>
      this.mapResultToTargetHealth(result, now),
    );

    const systemTargets = targets.filter(
      (t) => t.category === 'SYSTEM' && !t.is_stale,
    );
    const stale = targets.filter(
      (t) => t.category === 'SYSTEM' && t.is_stale,
    ).length;
    const healthy = systemTargets.filter((t) => t.is_up).length;
    const unhealthy = systemTargets.length - healthy;

    return {
      cluster_id: clusterId,
      status: this.deriveHealthStatus(systemTargets.length, healthy),
      summary: {
        total_targets: systemTargets.length,
        healthy,
        unhealthy,
        stale,
      },
      targets,
      checked_at: new Date().toISOString(),
    };
  }

  /**
   * Get historical health status over a time range.
   * Returns per-target time-series so the frontend can render availability charts.
   */
  async getHealthHistory(
    clusterId: string,
    start: string,
    end: string,
    step: string = '60s',
    serverId?: string,
  ): Promise<ClusterHealthHistoryResponseDto> {
    const startUnix = Math.floor(new Date(start).getTime() / 1000);
    const endUnix = Math.floor(new Date(end).getTime() / 1000);

    const results = await this.prometheusQuery.getClusterTargetsHealthHistory(
      clusterId,
      startUnix,
      endUnix,
      step,
      serverId,
    );

    const targets: TargetHealthHistoryDto[] = results.map((result) =>
      this.mapResultToTargetHistory(result),
    );

    return {
      cluster_id: clusterId,
      range_start: start,
      range_end: end,
      step,
      targets,
      queried_at: new Date().toISOString(),
    };
  }

  private mapResultToTargetHealth(
    result: PrometheusQueryResult,
    nowSeconds: number,
  ): TargetHealthDto {
    const timestamp = result.value ? result.value[0] : 0;
    const value = result.value ? Number.parseFloat(result.value[1]) : 0;
    const dataAge = Number.parseFloat((nowSeconds - timestamp).toFixed(1));

    return {
      instance: result.metric.instance || 'unknown',
      server_id: result.metric.server_id || undefined,
      category: this.classifyTarget(result),
      is_up: value === 1,
      is_stale: dataAge > STALE_THRESHOLD_SECONDS,
      last_scrape_timestamp: timestamp,
      data_age_seconds: dataAge,
    };
  }

  private mapResultToTargetHistory(
    result: PrometheusQueryResult,
  ): TargetHealthHistoryDto {
    const dataPoints: HealthHistoryPointDto[] = (result.values || []).map(
      ([timestamp, value]) => ({
        timestamp,
        datetime: new Date(timestamp * 1000).toISOString(),
        value: Number.parseFloat(value),
      }),
    );

    const upCount = dataPoints.filter((p) => p.value === 1).length;
    const uptimePercent =
      dataPoints.length > 0
        ? Number.parseFloat(((upCount / dataPoints.length) * 100).toFixed(2))
        : 0;

    return {
      instance: result.metric.instance || 'unknown',
      server_id: result.metric.server_id || undefined,
      uptime_percent: uptimePercent,
      data_points: dataPoints,
    };
  }

  private classifyTarget(result: PrometheusQueryResult): TargetCategory {
    const job = result.metric.job;
    if (job && SYSTEM_JOBS.has(job)) return 'SYSTEM';

    const namespace = result.metric.namespace;
    if (namespace && SYSTEM_NAMESPACES.has(namespace)) return 'SYSTEM';

    return 'APP';
  }

  private deriveHealthStatus(total: number, healthy: number): HealthStatus {
    if (total === 0) return 'UNKNOWN';
    if (healthy === total) return 'HEALTHY';
    if (healthy === 0) return 'DOWN';
    if (healthy / total < DOWN_THRESHOLD) return 'DOWN';
    return 'DEGRADED';
  }
}
