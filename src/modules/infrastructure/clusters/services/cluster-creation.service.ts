import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  ClusterEntity,
  ClusterStatus,
  ClusterType,
} from '../entities/cluster.entity';
import {
  InfrastructureOperationEntity,
  OperationStatus,
  OperationType,
} from '../../servers/entities/infrastructure-operations.entity';
import { CreateClusterDto } from '../dto/create-cluster.dto';
import { EncryptionService } from '../../../shared/encryption/services/encryption.service';
import { ClusterFirewallIntegrationService } from './cluster-firewall-integration.service';
import { getOperationSteps } from '../../operations/helpers/operation-steps.helper';
import { CreateClusterJobData } from '../clusters.service';
import { VNetSubnetEntity } from '../../vnets/entities/vnet-subnet.entity';
import {
  generateNipHostnameToken,
  isValidNipHostnameToken,
} from '../../../dns/utils/nip-token.util';
import { HostnameMode } from '../../../dns/enums/hostname-mode.enum';

/**
 * Service responsible for cluster creation logic
 */
@Injectable()
export class ClusterCreationService {
  private readonly logger = new Logger(ClusterCreationService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepository: Repository<InfrastructureOperationEntity>,
    @InjectRepository(VNetSubnetEntity)
    private readonly vnetSubnetRepository: Repository<VNetSubnetEntity>,
    @InjectQueue('infrastructure') private readonly infrastructureQueue: Queue,
    private readonly encryptionService: EncryptionService,
    private readonly clusterFirewallIntegrationService: ClusterFirewallIntegrationService,
  ) {}

  /**
   * Create a new K3s cluster
   */
  async createCluster(
    dto: CreateClusterDto,
  ): Promise<InfrastructureOperationEntity> {
    this.logger.log(`Creating cluster: ${dto.name}`);

    // Generate and encrypt K3s token
    const k3sToken = this.encryptionService.generateK3sToken();
    const k3sTokenEncrypted = this.encryptionService.encrypt(k3sToken);

    // Determine cluster type from metadata
    const metadata = dto.metadata || {};
    const clusterType = metadata.isObservabilityCluster
      ? ClusterType.OBSERVABILITY
      : ClusterType.WORKLOAD;

    // Resolve the environment-level VNet/Subnet (seeded at bootstrap by the CLI).
    // Every cluster — observability or workload — joins the same private network
    // so intra-cluster and inter-cluster traffic stays off the public interface.
    const envSubnet = await this.vnetSubnetRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });
    if (!envSubnet) {
      throw new BadRequestException(
        'No environment subnet registered. The CLI must provision a VNet/Subnet during `flui env create` before any cluster can be created.',
      );
    }
    metadata.vnetConfig = {
      vnetId: envSubnet.vnetId,
      subnetId: envSubnet.id,
      autoAssignIp: true,
    };
    this.logger.log(
      `Cluster ${dto.name} attached to environment subnet ${envSubnet.id} (${envSubnet.ipRange})`,
    );

    // Resolve nip.io hostname token: when running in IP mode, every cluster gets
    // a unique token segment so the LE domain set differs between recreations,
    // avoiding the 5-certs-per-7-days rate limit.
    const hostnameMode = dto.endpointHostnameMode ?? HostnameMode.IP;
    let nipHostnameToken: string | null = null;
    if (hostnameMode === HostnameMode.IP) {
      if (dto.nipHostnameToken) {
        if (!isValidNipHostnameToken(dto.nipHostnameToken)) {
          throw new BadRequestException(
            'nipHostnameToken must match [a-z0-9-], 1-30 chars, no leading/trailing dash.',
          );
        }
        nipHostnameToken = dto.nipHostnameToken;
      } else {
        nipHostnameToken = generateNipHostnameToken();
      }
      this.logger.log(
        `Cluster ${dto.name} nip.io hostname token: ${nipHostnameToken}`,
      );
    }

    // Create cluster record
    const cluster = this.clusterRepository.create({
      name: dto.name,
      provider: dto.provider,
      region: dto.region,
      nodeSize: dto.nodeSize,
      nodeCount: 0, // Will be updated as nodes are created
      autoscalingEnabled: dto.autoscalingEnabled || false,
      minNodes: dto.minNodes,
      maxNodes: dto.maxNodes,
      scaleUpMemoryPct: dto.scaleUpMemoryPct,
      scaleUpCpuPct: dto.scaleUpCpuPct,
      cooldownSeconds: dto.cooldownSeconds,
      k3sTokenEncrypted,
      k3sVersion: dto.k3sVersion,
      status: ClusterStatus.CREATING,
      clusterType,
      sshKeyIds: dto.sshKeys,
      image: dto.image,
      diskSizeGb: dto.diskSizeGb,
      endpointHostnameMode: dto.endpointHostnameMode,
      nipHostnameToken,
      // Flui shared storage (§14 of scaling doc). Default enabled for all
      // cluster types unless explicitly disabled via --no-shared-storage.
      // The architecture works on both OBSERVABILITY and WORKLOAD clusters;
      // the cluster-type discriminator is only for the future split where
      // observability gets its own dedicated topology.
      sharedStorageEnabled: dto.sharedStorageEnabled !== false,
      sharedStorageVolumeSizeGb: dto.sharedStorageVolumeSizeGb ?? 20,
      metadata,
    });

    const savedCluster = await this.clusterRepository.save(cluster);
    this.logger.log(`Cluster record created: ${savedCluster.id}`);

    // Create cluster firewall (BEFORE creating nodes).
    // Intra-cluster Prometheus scraping no longer requires public firewall rules:
    // observability ↔ workload metrics traffic flows over the environment VNet.
    let providerFirewallId: string | null = null;
    try {
      const desiredRules = dto.firewallRules || [];

      providerFirewallId =
        await this.clusterFirewallIntegrationService.createAndReconcileFirewall(
          savedCluster,
          desiredRules,
        );
      this.logger.log(
        `Firewall created for cluster ${savedCluster.id}: ${providerFirewallId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create firewall for cluster ${savedCluster.id}: ${error.message}`,
        error.stack,
      );
      // Firewall creation failure should fail cluster creation
      await this.clusterRepository.delete(savedCluster.id);
      throw new BadRequestException(
        `Failed to create cluster firewall: ${error.message}`,
      );
    }

    // Use worker count directly from DTO
    const workerCount = dto.workerCount;

    // Generate dynamic steps based on cluster configuration
    const withFirewall = !!providerFirewallId;
    const operationSteps = getOperationSteps(OperationType.CREATE_CLUSTER, {
      workerCount,
      withFirewall,
    });

    // Create operation for tracking
    const operation = this.operationRepository.create({
      operationType: OperationType.CREATE_CLUSTER,
      status: OperationStatus.PENDING,
      resourceType: 'cluster',
      resourceName: dto.name,
      resourceId: savedCluster.id,
      provider: dto.provider,
      totalSteps: operationSteps.length,
      currentStepIndex: 0,
      currentStepProgress: 0,
      metadata: {
        clusterConfig: dto,
        estimatedDurationInSeconds: 900,
        providerFirewallId, // Single firewall ID (not array)
        operationSteps: operationSteps, // Fixed: was 'steps', now 'operationSteps'
      },
    });

    const savedOperation = await this.operationRepository.save(operation);

    // Queue cluster creation job
    const jobData: CreateClusterJobData = {
      operationId: savedOperation.id,
      clusterId: savedCluster.id,
    };

    await this.infrastructureQueue.add('create-cluster', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      timeout: 1800000, // 30 minutes
    });

    this.logger.log(
      `Cluster creation job queued for cluster ${savedCluster.id} with operation ${savedOperation.id}`,
    );

    return savedOperation;
  }
}
