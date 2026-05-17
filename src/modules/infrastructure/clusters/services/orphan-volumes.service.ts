import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../entities/cluster.entity';
import { ProviderFactory } from 'src/modules/providers/services/provider.factory';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { ProviderVolumeSummary } from 'src/modules/providers/interfaces/cloud-provider.interface';

export interface OrphanVolume {
  provider: string;
  volumeId: string;
  name: string;
  sizeGb: number;
  region?: string;
  attached: boolean;
  attachedServerId: string | null;
  labels: Record<string, string>;
  createdAt?: string;
  reason: 'no-matching-cluster' | 'cluster-volume-id-mismatch';
}

@Injectable()
export class OrphanVolumesService {
  private readonly logger = new Logger(OrphanVolumesService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly providerFactory: ProviderFactory,
  ) {}

  async scan(providers?: CloudProvider[]): Promise<OrphanVolume[]> {
    const targets = providers?.length
      ? providers
      : [CloudProvider.HETZNER, CloudProvider.SCALEWAY];
    const clusterVolumeIds = await this.knownClusterVolumeIds();

    const out: OrphanVolume[] = [];
    for (const p of targets) {
      const provider = this.providerFactory.getProvider(p);
      if (!provider.listFluiManagedVolumes) continue;
      let volumes: ProviderVolumeSummary[];
      try {
        volumes = await provider.listFluiManagedVolumes();
      } catch (err) {
        this.logger.warn(
          `${p} listFluiManagedVolumes failed: ${(err as Error).message}`,
        );
        continue;
      }
      for (const v of volumes) {
        if (clusterVolumeIds.has(v.volumeId)) continue;
        out.push({
          provider: p,
          volumeId: v.volumeId,
          name: v.name,
          sizeGb: v.sizeGb,
          region: v.region,
          attached: !!v.attachedServerId,
          attachedServerId: v.attachedServerId ?? null,
          labels: v.labels,
          createdAt: v.createdAt,
          reason: 'no-matching-cluster',
        });
      }
    }
    return out;
  }

  async cleanup(
    provider: CloudProvider,
    volumeId: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const knownIds = await this.knownClusterVolumeIds();
    if (knownIds.has(volumeId)) {
      throw new NotFoundException(
        `Volume ${volumeId} is still referenced by an existing cluster — refusing to delete`,
      );
    }
    const svc = this.providerFactory.getProvider(provider);
    if (!svc.deleteVolume) {
      return {
        deleted: false,
        message: `Provider ${provider} has no deleteVolume primitive`,
      };
    }
    if (svc.detachVolume) {
      try {
        await svc.detachVolume(volumeId);
      } catch (err) {
        this.logger.warn(
          `Detach failed for ${volumeId}: ${(err as Error).message}`,
        );
      }
    }
    await svc.deleteVolume(volumeId);
    return { deleted: true, message: `Deleted ${volumeId} from ${provider}` };
  }

  private async knownClusterVolumeIds(): Promise<Set<string>> {
    const clusters = await this.clusterRepository.find();
    const ids = new Set<string>();
    for (const c of clusters) {
      if (c.sharedStorageVolumeId) ids.add(c.sharedStorageVolumeId);
    }
    return ids;
  }
}
