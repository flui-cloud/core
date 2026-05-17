import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerEntity } from '../../infrastructure/servers/entities/server.entity';
import {
  ClusterNodeEntity,
  NodeStatus,
  NodeType,
} from '../../infrastructure/clusters/entities/cluster-node.entity';
import { PrometheusTargetDto } from '../dto';

/**
 * Prometheus Configuration Service
 *
 * Generates Prometheus HTTP Service Discovery targets dynamically
 * by querying all managed servers from the database.
 */
@Injectable()
export class PrometheusConfigService {
  private readonly logger = new Logger(PrometheusConfigService.name);

  constructor(
    @InjectRepository(ServerEntity)
    private readonly serverRepository: Repository<ServerEntity>,
    @InjectRepository(ClusterNodeEntity)
    private readonly clusterNodeRepository: Repository<ClusterNodeEntity>,
  ) {}

  /**
   * @deprecated Pull-based HTTP SD is replaced by push-based vmagent → vmsingle
   * for clusters created after ADR-001-metrics-transport. Kept to serve legacy
   * clusters that still scrape this endpoint until they are recreated.
   */
  async getPrometheusTargets(): Promise<PrometheusTargetDto[]> {
    const startTime = Date.now();
    const targets: PrometheusTargetDto[] = [];

    try {
      this.logger.log('🔍 HTTP Service Discovery request received');

      // Get all regular VPS servers
      const servers = await this.serverRepository.find({
        where: { status: 'ACTIVE' },
      });

      for (const server of servers) {
        if (server.ipAddress) {
          targets.push({
            targets: [`${server.ipAddress}:9100`],
            labels: {
              __meta_server_id: server.id,
              __meta_server_type: 'vps',
              __meta_cloud_provider: server.provider || 'unknown',
              __meta_region: server.region || 'unknown',
              job: 'flui-servers',
            },
          });
        }
      }

      // Get all cluster nodes (K3s master and workers)
      const clusterNodes = await this.clusterNodeRepository.find({
        where: { status: NodeStatus.READY },
        relations: ['cluster'],
      });

      for (const node of clusterNodes) {
        if (node.ipAddress) {
          targets.push({
            targets: [`${node.ipAddress}:9100`],
            labels: {
              __meta_server_id: node.id,
              __meta_server_type:
                node.nodeType === NodeType.MASTER ? 'k3s-master' : 'k3s-worker',
              __meta_cloud_provider: node.cluster?.provider || 'unknown',
              __meta_region: node.cluster?.region || 'unknown',
              __meta_cluster_id: node.clusterId,
              __meta_cluster_name: node.cluster?.name || 'unknown',
              __meta_cluster_type: node.cluster?.clusterType || 'unknown',
              __meta_node_type: node.nodeType || 'unknown',
              job: 'flui-k3s-nodes',
            },
          });
        }
      }

      // K3s kubelet metrics (port 10250) — includes cAdvisor for container CPU/memory
      for (const node of clusterNodes) {
        if (node.ipAddress) {
          targets.push({
            targets: [`${node.ipAddress}:10250`],
            labels: {
              __meta_server_id: node.id,
              __meta_server_type:
                node.nodeType === NodeType.MASTER ? 'k3s-master' : 'k3s-worker',
              __meta_cloud_provider: node.cluster?.provider || 'unknown',
              __meta_cluster_id: node.clusterId,
              __meta_cluster_name: node.cluster?.name || 'unknown',
              __meta_node_type: node.nodeType || 'unknown',
              job: 'flui-k3s-kubelet',
            },
          });
        }
      }

      const duration = Date.now() - startTime;

      // Enhanced logging with cluster breakdown
      this.logger.log(
        `✅ Generated ${targets.length} targets in ${duration}ms | ` +
          `VPS: ${servers.length}, K3s nodes: ${clusterNodes.length} (node_exporter+kubelet)`,
      );

      // Log cluster breakdown
      const clusterMap = new Map<string, number>();
      for (const node of clusterNodes) {
        const clusterName = node.cluster?.name || 'unknown';
        clusterMap.set(clusterName, (clusterMap.get(clusterName) || 0) + 1);
      }

      if (clusterMap.size > 0) {
        const breakdown = Array.from(clusterMap.entries())
          .map(([name, count]) => `${name}(${count})`)
          .join(', ');
        this.logger.log(`📊 Clusters: ${breakdown}`);
      }

      return targets;
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate targets: ${error.message}`,
        error.stack,
      );
      // Return empty array instead of throwing - Prometheus can continue with other jobs
      return [];
    }
  }

  /**
   * Get service discovery statistics
   */
  async getServiceDiscoveryStats(): Promise<{
    total_targets: number;
    by_type: Record<string, number>;
    last_updated: string;
  }> {
    const targets = await this.getPrometheusTargets();

    const byType: Record<string, number> = {};
    for (const target of targets) {
      const serverType = target.labels.__meta_server_type;
      byType[serverType] = (byType[serverType] || 0) + 1;
    }

    return {
      total_targets: targets.length,
      by_type: byType,
      last_updated: new Date().toISOString(),
    };
  }
}
