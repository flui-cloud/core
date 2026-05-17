import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { ClusterNodeEntity } from '../../infrastructure/clusters/entities/cluster-node.entity';
import { ApplicationEntity } from '../../applications/entities/application.entity';
import { ApplicationStatus } from '../../applications/enums/application-status.enum';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderDefinitionsService } from '../../management/services/provider-definitions.service';
import { SupportedRegionDto } from '../dto/supported-region.dto';
import {
  ClusterAppDistributionDto,
  DistributionAppDto,
  DistributionClusterDto,
  DistributionNodeDto,
} from '../dto/cluster-app-distribution.dto';

@Injectable()
export class VisualizationsService {
  private readonly logger = new Logger(VisualizationsService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepo: Repository<ClusterEntity>,
    @InjectRepository(ClusterNodeEntity)
    private readonly nodeRepo: Repository<ClusterNodeEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepo: Repository<ApplicationEntity>,
    private readonly providerDefinitions: ProviderDefinitionsService,
  ) {}

  async getSupportedRegions(): Promise<SupportedRegionDto[]> {
    const providers = Object.values(CloudProvider);

    const all = await Promise.all(
      providers.map(async (provider) => {
        const regions =
          await this.providerDefinitions.getProviderRegions(provider);
        return regions
          .filter(
            (r) =>
              typeof r.latitude === 'number' && typeof r.longitude === 'number',
          )
          .map<SupportedRegionDto>((r) => ({
            provider,
            id: r.id,
            name: r.name,
            displayName: r.displayName,
            country: r.country,
            flagEmoji: r.flagEmoji,
            latitude: r.latitude,
            longitude: r.longitude,
          }));
      }),
    );

    return all.flat();
  }

  async getClusterAppDistribution(
    userId?: string,
  ): Promise<ClusterAppDistributionDto> {
    const clusters = await this.clusterRepo.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    if (clusters.length === 0) {
      return {
        clusters: [],
        totals: { clusters: 0, nodes: 0, apps: 0, replicas: 0 },
      };
    }

    const clusterIds = clusters.map((c) => c.id);

    const [nodes, apps] = await Promise.all([
      this.nodeRepo
        .createQueryBuilder('node')
        .where('node.clusterId IN (:...ids)', { ids: clusterIds })
        .orderBy('node.createdAt', 'ASC')
        .getMany(),
      (() => {
        const qb = this.applicationRepo
          .createQueryBuilder('app')
          .where('app.clusterId IN (:...ids)', { ids: clusterIds })
          .andWhere('app.deletedAt IS NULL')
          .andWhere('app.status != :deleted', {
            deleted: ApplicationStatus.DELETED,
          });
        if (userId) {
          qb.andWhere('(app.userId = :userId OR app.userId IS NULL)', {
            userId,
          });
        }
        return qb.orderBy('app.createdAt', 'ASC').getMany();
      })(),
    ]);

    const nodesByCluster = groupBy(nodes, (n) => n.clusterId);
    const appsByCluster = groupBy(apps, (a) => a.clusterId);

    const clusterDtos: DistributionClusterDto[] = clusters.map((cluster) => {
      const clusterNodes = nodesByCluster.get(cluster.id) ?? [];
      const clusterApps = appsByCluster.get(cluster.id) ?? [];

      const nodeDtos: DistributionNodeDto[] = clusterNodes.map((n) => ({
        id: n.id,
        name: n.serverName,
        nodeType: n.nodeType,
        status: n.status,
        ipAddress: n.ipAddress,
      }));

      const appDtos: DistributionAppDto[] = clusterApps.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        status: a.status,
        replicas: a.replicas,
        k8sNamespace: a.k8sNamespace,
        imageRef: a.imageRef,
      }));

      const totalReplicas = appDtos.reduce((sum, a) => sum + a.replicas, 0);

      return {
        id: cluster.id,
        name: cluster.name,
        provider: cluster.provider as CloudProvider,
        region: cluster.region,
        status: cluster.status,
        clusterType: cluster.clusterType,
        nodes: nodeDtos,
        apps: appDtos,
        totalApps: appDtos.length,
        totalReplicas,
      };
    });

    const totals = {
      clusters: clusterDtos.length,
      nodes: clusterDtos.reduce((s, c) => s + c.nodes.length, 0),
      apps: clusterDtos.reduce((s, c) => s + c.totalApps, 0),
      replicas: clusterDtos.reduce((s, c) => s + c.totalReplicas, 0),
    };

    return { clusters: clusterDtos, totals };
  }
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = map.get(k);
    if (arr) {
      arr.push(item);
    } else {
      map.set(k, [item]);
    }
  }
  return map;
}
