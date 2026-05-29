import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { ApplicationEntity } from '../entities/application.entity';

export interface DedicatedPlacementReport {
  nodeName: string;
  target: 'master' | 'worker';
  allocatable: { cpu: number; memory: number };
  used: { cpu: number; memory: number };
  free: { cpu: number; memory: number };
  required: { cpu: number; memory: number };
  fits: boolean;
}

@Injectable()
export class DedicatedPlacementService {
  private readonly logger = new Logger(DedicatedPlacementService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly kubernetesService: KubernetesService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async assertFitsOrThrow(app: ApplicationEntity): Promise<void> {
    if (app.persistenceScope !== 'dedicated') return;

    const report = await this.evaluate(app);
    if (!report) return;
    if (report.fits) return;

    const fmtCpu = (m: number) => `${(m / 1000).toFixed(2)}`;
    const fmtMem = (mi: number) => `${(mi / 1024).toFixed(2)} GiB`;
    const placement =
      report.target === 'master'
        ? 'the master node'
        : `node ${report.nodeName}`;

    throw new BadRequestException({
      code: 'DEDICATED_NODE_CAPACITY_INSUFFICIENT',
      message:
        `App "${app.slug}" requires dedicated placement on ${placement}, ` +
        `but that node does not have enough free capacity. ` +
        `Free: ${fmtCpu(report.free.cpu)} CPU, ${fmtMem(report.free.memory)}; ` +
        `required: ${fmtCpu(report.required.cpu)} CPU, ${fmtMem(report.required.memory)}. ` +
        `Run \`flui env capacity\` to see scale-up options, or ` +
        `\`flui env scale-node ${report.nodeName}\` to upgrade the node server type.`,
      details: report,
    });
  }

  /** Worker with the most headroom, or null when the cluster has no worker. */
  async selectBestWorker(app: ApplicationEntity): Promise<string | null> {
    const kubeconfig = await this.resolveKubeconfig(app);
    if (!kubeconfig) return null;

    const workers =
      await this.kubernetesService.listWorkerNodeCapacities(kubeconfig);
    if (workers.length === 0) return null;

    const required = this.requiredResources(app);
    const score = (w: (typeof workers)[number]): number =>
      Math.min(
        w.free.cpu / Math.max(1, required.cpu),
        w.free.memory / Math.max(1, required.memory),
      );

    const fitting = workers.filter(
      (w) => required.cpu <= w.free.cpu && required.memory <= w.free.memory,
    );
    // none fit → still return the roomiest so the precheck reports a real node
    const pool = fitting.length > 0 ? fitting : workers;
    pool.sort((a, b) => score(b) - score(a));
    return pool[0].nodeName;
  }

  async evaluate(
    app: ApplicationEntity,
  ): Promise<DedicatedPlacementReport | null> {
    const kubeconfig = await this.resolveKubeconfig(app);
    if (!kubeconfig) return null;

    let capacity: Awaited<
      ReturnType<KubernetesService['getMasterNodeCapacity']>
    >;
    let target: 'master' | 'worker';
    if (app.dedicatedNodeName) {
      capacity = await this.kubernetesService.getNodeCapacityByName(
        kubeconfig,
        app.dedicatedNodeName,
      );
      target = 'worker';
    } else if (app.allowMasterPlacement) {
      capacity = await this.kubernetesService.getMasterNodeCapacity(kubeconfig);
      target = 'master';
    } else {
      const worker = await this.selectBestWorker(app);
      if (!worker) return null;
      capacity = await this.kubernetesService.getNodeCapacityByName(
        kubeconfig,
        worker,
      );
      target = 'worker';
    }
    if (!capacity) {
      this.logger.warn(
        `Cluster ${app.clusterId} target node not resolvable — skipping placement precheck`,
      );
      return null;
    }

    const required = this.requiredResources(app);
    const free = {
      cpu: capacity.allocatable.cpu - capacity.requested.cpu,
      memory: capacity.allocatable.memory - capacity.requested.memory,
    };
    const fits = required.cpu <= free.cpu && required.memory <= free.memory;
    return {
      nodeName: capacity.nodeName,
      target,
      allocatable: capacity.allocatable,
      used: capacity.requested,
      free,
      required,
      fits,
    };
  }

  private async resolveKubeconfig(
    app: ApplicationEntity,
  ): Promise<string | null> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: app.clusterId },
    });
    if (!cluster?.kubeconfigEncrypted) {
      this.logger.warn(
        `Cluster ${app.clusterId} missing kubeconfig — skipping placement precheck`,
      );
      return null;
    }
    return this.encryptionService.decrypt(cluster.kubeconfigEncrypted);
  }

  private requiredResources(app: ApplicationEntity): {
    cpu: number;
    memory: number;
  } {
    const cpuStr = app.resources?.cpu?.request ?? '100m';
    const memStr = app.resources?.memory?.request ?? '128Mi';
    const replicas = Math.max(1, app.replicas ?? 1);
    return {
      cpu: this.kubernetesService.parseCpu(cpuStr) * replicas,
      memory: this.kubernetesService.parseMemory(memStr) * replicas,
    };
  }
}
