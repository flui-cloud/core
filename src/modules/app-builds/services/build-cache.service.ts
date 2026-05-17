import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import {
  InfrastructureOperationEntity,
  OperationType,
  OperationStatus,
  ClearBuildCacheOperationMetadata,
} from '../../infrastructure/servers/entities/infrastructure-operations.entity';
import { BuildCacheInspectionService } from './build-cache-inspection.service';
import {
  BuildCacheBreakdownResponseDto,
  RefreshCacheBreakdownResponseDto,
} from '../dto/build-cache-breakdown.dto';
import { InfrastructureOperationsGateway } from '../../infrastructure/operations/gateway/infrastructure-operations.gateway';
import {
  calculateOperationProgressFromSaved,
  getOperationSteps,
} from '../../infrastructure/operations/helpers/operation-steps.helper';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import {
  BuildJobService,
  BUILD_CACHE_PVC_NAME,
  BUILD_NAMESPACE,
} from './build-job.service';
import { BuildAgentConfigService } from './build-agent-config.service';
import {
  BuildCacheInfoResponseDto,
  ClearBuildCacheResponseDto,
} from '../dto/build-namespace.dto';

@Injectable()
export class BuildCacheService {
  private readonly logger = new Logger(BuildCacheService.name);

  constructor(
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepository: Repository<InfrastructureOperationEntity>,
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly buildJobService: BuildJobService,
    private readonly encryptionService: EncryptionService,
    private readonly infraGateway: InfrastructureOperationsGateway,
    private readonly inspectionService: BuildCacheInspectionService,
    private readonly buildAgentConfig: BuildAgentConfigService,
  ) {}

  /**
   * Return info about the flui-buildkit-cache PVC for a given cluster.
   */
  async getCacheInfo(clusterId: string): Promise<BuildCacheInfoResponseDto> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster?.kubeconfigEncrypted) {
      throw new NotFoundException(
        `Cluster ${clusterId} not found or has no kubeconfig`,
      );
    }
    const kubeconfig = this.encryptionService.decrypt(
      cluster.kubeconfigEncrypted,
    );
    const info = await this.buildJobService.getBuildCachePvcInfo(kubeconfig);

    const dto = new BuildCacheInfoResponseDto();
    dto.pvcName = BUILD_CACHE_PVC_NAME;
    dto.namespace = BUILD_NAMESPACE;
    dto.exists = info.exists;
    dto.phase = info.phase;
    dto.capacity = info.capacity;
    dto.storageClass = info.storageClass;
    dto.createdAt = info.createdAt;
    return dto;
  }

  /**
   * Start an async cache-clear operation: delete + recreate the PVC.
   * Returns immediately with the operationId. Progress is emitted via WebSocket
   * on the /infrastructure namespace, room operation:{operationId}.
   */
  async clearCacheAsync(
    clusterId: string,
    userId?: string,
  ): Promise<ClearBuildCacheResponseDto> {
    if (!this.buildAgentConfig.isInClusterBuildAgentEnabled()) {
      throw new ConflictException(
        'Cache clear is unavailable: in-cluster build agent is disabled. ' +
          'Set FLUI_IN_CLUSTER_BUILD_AGENT_ENABLED=true to re-enable.',
      );
    }

    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    const steps = getOperationSteps(OperationType.CLEAR_BUILD_CACHE);
    const storageClass = 'local-path';
    const storage = '20Gi';

    const operation = this.operationRepository.create({
      operationType: OperationType.CLEAR_BUILD_CACHE,
      status: OperationStatus.PENDING,
      resourceType: 'build-cache',
      resourceName: BUILD_CACHE_PVC_NAME,
      resourceId: clusterId,
      userId,
      totalSteps: steps.length,
      currentStepIndex: 0,
      currentStepProgress: 0,
      metadata: {
        clusterId,
        pvcName: BUILD_CACHE_PVC_NAME,
        storageClass,
        storage,
        operationSteps: steps,
        estimatedDurationInSeconds: 25,
      } as ClearBuildCacheOperationMetadata,
    });
    const saved = await this.operationRepository.save(operation);

    this.executeCacheClear(saved.id, cluster).catch((err) => {
      this.logger.error(
        `Cache clear operation ${saved.id} failed unexpectedly: ${err.message}`,
        err.stack,
      );
    });

    const response = new ClearBuildCacheResponseDto();
    response.operationId = saved.id;
    response.status = 'started';
    return response;
  }

  private async executeCacheClear(
    operationId: string,
    cluster: ClusterEntity,
  ): Promise<void> {
    const startedAt = Date.now();
    const steps = getOperationSteps(OperationType.CLEAR_BUILD_CACHE);

    const emitProgress = (
      stepIndex: number,
      stepProgress: number,
      message: string,
    ) => {
      const percentage = calculateOperationProgressFromSaved(
        steps,
        stepIndex,
        stepProgress,
      );
      this.infraGateway.emitProgress(operationId, cluster.id, {
        operationId,
        resourceId: cluster.id,
        operationType: OperationType.CLEAR_BUILD_CACHE,
        resourceType: 'build-cache',
        percentage,
        currentStepIndex: stepIndex,
        totalSteps: steps.length,
        message,
        timestamp: new Date(),
      });
      return this.operationRepository.update(operationId, {
        status: OperationStatus.IN_PROGRESS,
        currentStepIndex: stepIndex,
        currentStepProgress: stepProgress,
      });
    };

    try {
      if (!cluster.kubeconfigEncrypted) {
        throw new Error('Cluster has no kubeconfig');
      }
      const kubeconfig = this.encryptionService.decrypt(
        cluster.kubeconfigEncrypted,
      );

      // Step 0 — INIT
      await this.operationRepository.update(operationId, {
        status: OperationStatus.IN_PROGRESS,
      });
      await emitProgress(
        0,
        0,
        'Validating cache PVC and cluster connectivity...',
      );

      const pvcInfo =
        await this.buildJobService.getBuildCachePvcInfo(kubeconfig);
      await emitProgress(
        0,
        100,
        pvcInfo.exists
          ? `Cache PVC found (${pvcInfo.capacity ?? 'unknown size'}, ${pvcInfo.phase})`
          : 'Cache PVC not found — will recreate',
      );

      // Step 1 — DELETE
      await emitProgress(1, 0, 'Deleting BuildKit cache PVC...');

      if (pvcInfo.exists) {
        await this.buildJobService.deleteBuildCachePvc(kubeconfig);
        await this.waitForPvcDeletion(kubeconfig, operationId, steps);
      }

      await emitProgress(1, 100, 'Cache PVC deleted');

      // Step 2 — RECREATE
      await emitProgress(2, 0, 'Recreating empty cache PVC...');
      await this.buildJobService.ensureBuildCachePvc(kubeconfig);
      await emitProgress(2, 100, 'Cache PVC recreated and ready');

      const duration = Date.now() - startedAt;
      await this.operationRepository.update(operationId, {
        status: OperationStatus.COMPLETED,
        currentStepIndex: steps.length - 1,
        currentStepProgress: 100,
        completedAt: new Date(),
      });
      this.infraGateway.emitCompleted(operationId, cluster.id, {
        operationId,
        resourceId: cluster.id,
        operationType: OperationType.CLEAR_BUILD_CACHE,
        resourceType: 'build-cache',
        duration,
        timestamp: new Date(),
      });
    } catch (err) {
      this.logger.error(
        `Cache clear ${operationId} failed: ${err.message}`,
        err.stack,
      );
      await this.operationRepository.update(operationId, {
        status: OperationStatus.FAILED,
        metadata: { error: err.message },
      });
      this.infraGateway.emitFailed(operationId, cluster.id, {
        operationId,
        resourceId: cluster.id,
        operationType: OperationType.CLEAR_BUILD_CACHE,
        resourceType: 'build-cache',
        error: err.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Poll until the PVC is fully removed or 30s timeout.
   * Emits intermediate progress within step 1 (10% → 90%) while waiting.
   */
  private async waitForPvcDeletion(
    kubeconfig: string,
    operationId: string,
    steps: ReturnType<typeof getOperationSteps>,
  ): Promise<void> {
    const maxWaitMs = 30_000;
    const intervalMs = 500;
    const start = Date.now();
    let iteration = 0;

    while (Date.now() - start < maxWaitMs) {
      const info = await this.buildJobService.getBuildCachePvcInfo(kubeconfig);
      if (!info.exists) return;

      iteration++;
      const elapsed = Date.now() - start;
      const progress = Math.min(
        90,
        Math.round((elapsed / maxWaitMs) * 90) + 10,
      );
      const percentage = calculateOperationProgressFromSaved(
        steps,
        1,
        progress,
      );
      this.infraGateway.emitProgress(operationId, '', {
        operationId,
        resourceId: '',
        operationType: OperationType.CLEAR_BUILD_CACHE,
        resourceType: 'build-cache',
        percentage,
        currentStepIndex: 1,
        totalSteps: steps.length,
        message: `Waiting for PVC deletion... (${Math.round(elapsed / 1000)}s)`,
        timestamp: new Date(),
      });

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(
      `Timed out waiting for PVC ${BUILD_CACHE_PVC_NAME} to be deleted after 30s`,
    );
  }

  /** Return the cached breakdown from DB — never makes a K8s call. */
  getCacheBreakdown(
    clusterId: string,
  ): Promise<BuildCacheBreakdownResponseDto> {
    return this.inspectionService.getCacheBreakdown(clusterId);
  }

  /** Manually trigger a cache inspection. Returns immediately. */
  requestRefresh(clusterId: string): Promise<RefreshCacheBreakdownResponseDto> {
    return this.inspectionService.requestRefresh(clusterId);
  }
}
