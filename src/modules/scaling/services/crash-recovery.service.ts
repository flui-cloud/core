import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as k8s from '@kubernetes/client-node';
import { ApplicationEntity } from '../../applications/entities/application.entity';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { ApplicationEventsGateway } from '../../applications/gateway/application-events.gateway';
import { CrashDiagnosesRepository } from '../repositories/crash-diagnoses.repository';
import { CrashCategory } from '../enums/crash-category.enum';
import { CrashDiagnosisStatusFilter } from '../enums/crash-diagnosis-status-filter.enum';

const STABILITY_WINDOW_MS = 90_000;

interface ContainerTracker {
  podUid: string;
  healthySince: number;
  restartCount: number;
}

@Injectable()
export class CrashRecoveryService implements OnModuleDestroy {
  private readonly logger = new Logger(CrashRecoveryService.name);
  private readonly watches = new Map<string, AbortController>();
  private readonly trackers = new Map<string, ContainerTracker>();

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepo: Repository<ClusterEntity>,
    private readonly kubernetesService: KubernetesService,
    private readonly encryptionService: EncryptionService,
    private readonly crashDiagnosesRepository: CrashDiagnosesRepository,
    private readonly eventsGateway: ApplicationEventsGateway,
  ) {}

  async ensureWatching(app: ApplicationEntity): Promise<void> {
    if (this.watches.has(app.id)) return;

    const cluster = await this.clusterRepo.findOne({
      where: { id: app.clusterId },
    });
    if (!cluster?.kubeconfigEncrypted) {
      this.logger.warn(
        `Cannot start crash recovery watch for app ${app.id}: cluster has no kubeconfig`,
      );
      return;
    }

    const kubeconfig = this.encryptionService.decrypt(
      cluster.kubeconfigEncrypted,
    );

    const controller = new AbortController();
    this.watches.set(app.id, controller);

    this.logger.log(
      `Crash recovery watch opened for app ${app.slug} (${app.id})`,
    );

    try {
      await this.kubernetesService.watchPodEvents(
        kubeconfig,
        app.k8sNamespace,
        `flui-app-id=${app.id}`,
        (type, pod) => this.onPodEvent(app, type, pod),
        controller,
      );
    } catch (err) {
      this.logger.warn(
        `Crash recovery watch failed to start for app ${app.id}: ${(err as Error).message}`,
      );
      this.stopWatching(app.id);
    }
  }

  stopWatching(appId: string): void {
    const controller = this.watches.get(appId);
    if (controller) {
      try {
        controller.abort();
      } catch {
        /* noop */
      }
      this.watches.delete(appId);
    }
    const prefix = `${appId}::`;
    for (const key of this.trackers.keys()) {
      if (key.startsWith(prefix)) this.trackers.delete(key);
    }
  }

  onModuleDestroy(): void {
    for (const appId of Array.from(this.watches.keys())) {
      this.stopWatching(appId);
    }
  }

  private async onPodEvent(
    app: ApplicationEntity,
    type: string,
    pod: k8s.V1Pod,
  ): Promise<void> {
    if (type === 'DELETED') return;
    const podUid = pod.metadata?.uid;
    const phase = pod.status?.phase;
    const containerStatuses = pod.status?.containerStatuses ?? [];
    if (!podUid || !containerStatuses.length) return;

    for (const cs of containerStatuses) {
      await this.evaluateContainer(app, podUid, phase, cs);
    }
  }

  private async evaluateContainer(
    app: ApplicationEntity,
    podUid: string,
    phase: string | undefined,
    cs: k8s.V1ContainerStatus,
  ): Promise<void> {
    const key = `${app.id}::${cs.name}`;
    const tracker = this.trackers.get(key);
    const isHealthy =
      phase === 'Running' &&
      cs.ready === true &&
      cs.started === true &&
      !cs.state?.waiting &&
      !cs.state?.terminated;

    if (!isHealthy) {
      if (tracker) this.trackers.delete(key);
      return;
    }

    if (tracker && cs.restartCount > tracker.restartCount) {
      this.trackers.delete(key);
      return;
    }

    if (tracker?.podUid !== podUid) {
      this.trackers.set(key, {
        podUid,
        healthySince: Date.now(),
        restartCount: cs.restartCount,
      });
      return;
    }

    if (Date.now() - tracker.healthySince < STABILITY_WINDOW_MS) return;

    await this.resolveForContainer(app, cs.name);
    this.trackers.delete(key);
  }

  private async resolveForContainer(
    app: ApplicationEntity,
    containerName: string,
  ): Promise<void> {
    const unresolved = await this.crashDiagnosesRepository.findByApplication(
      app.id,
      { status: CrashDiagnosisStatusFilter.UNRESOLVED, limit: 200 },
    );
    const categories = new Set<CrashCategory>(
      unresolved
        .filter((d) => d.containerName === containerName)
        .map((d) => d.category),
    );
    if (!categories.size) return;

    for (const category of categories) {
      const count =
        await this.crashDiagnosesRepository.markResolvedForContainer(
          app.id,
          containerName,
          category,
        );
      if (count > 0) {
        this.logger.log(
          `Resolved ${count} diagnoses (app=${app.id} container=${containerName} category=${category})`,
        );
        this.eventsGateway.emitCrashResolved(app.id, {
          containerName,
          category,
          count,
        });
      }
    }

    const stillOpen = await this.crashDiagnosesRepository.findByApplication(
      app.id,
      { status: CrashDiagnosisStatusFilter.UNRESOLVED, limit: 1 },
    );
    if (!stillOpen.length) this.stopWatching(app.id);
  }
}
