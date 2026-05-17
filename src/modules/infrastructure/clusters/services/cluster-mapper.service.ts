import { Injectable } from '@nestjs/common';
import { ClusterEntity } from '../entities/cluster.entity';
import { ClusterResponseDto } from '../dto/cluster-response.dto';

/**
 * Service responsible for mapping entities to DTOs
 */
@Injectable()
export class ClusterMapperService {
  /**
   * Map ClusterEntity to ClusterResponseDto
   */
  mapToDto(cluster: ClusterEntity): ClusterResponseDto {
    // Extract VNet info from metadata if present
    const vnetConfig = cluster.metadata?.vnetConfig;
    const grafanaConfig = cluster.metadata?.grafana;
    const masterNode = cluster.nodes?.find(
      (node) => node.nodeType === 'master',
    );

    return {
      id: cluster.id,
      name: cluster.name,
      provider: cluster.provider,
      region: cluster.region,
      nodeSize: cluster.nodeSize,
      nodeCount: cluster.nodeCount,
      status: cluster.status,
      clusterType: cluster.clusterType,
      autoscalingEnabled: cluster.autoscalingEnabled,
      minNodes: cluster.minNodes,
      maxNodes: cluster.maxNodes,
      k3sVersion: cluster.k3sVersion,
      masterIpAddress: masterNode?.ipAddress,
      vnetId: vnetConfig?.vnetId,
      vnetName: vnetConfig?.vnetName,
      grafanaPrometheusUid: grafanaConfig?.prometheusUid,
      grafanaLokiUid: grafanaConfig?.lokiUid,
      nodes:
        cluster.nodes?.map((node) => ({
          id: node.id,
          serverName: node.serverName || `node-${node.id.substring(0, 8)}`,
          nodeType: node.nodeType,
          ipAddress: node.ipAddress,
          status: node.status,
          createdAt: node.createdAt,
        })) || [],
      createdAt: cluster.createdAt,
      updatedAt: cluster.updatedAt,
    };
  }

  /**
   * Map multiple entities to DTOs
   */
  mapToDtos(clusters: ClusterEntity[]): ClusterResponseDto[] {
    return clusters.map((cluster) => this.mapToDto(cluster));
  }
}
