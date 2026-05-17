import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../entities/cluster.entity';
import {
  InfrastructureOperationEntity,
  OperationStatus,
  OperationType,
} from '../../servers/entities/infrastructure-operations.entity';
import { UpdateClusterVNetDto } from '../dto/update-cluster-vnet.dto';
import { getOperationSteps } from '../../operations/helpers/operation-steps.helper';
import { ProviderFactory } from 'src/modules/providers/services/provider.factory';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { VNetsService } from '../../vnets/services/vnets.service';
import { SubnetsService } from '../../vnets/services/subnets.service';

export interface AttachClusterToVNetJobData {
  operationId: string;
  clusterId: string;
  vnetConfig: {
    vnetId: string;
    subnetId?: string;
    autoAssignIp?: boolean;
  };
}

@Injectable()
export class ClusterVNetService {
  private readonly logger = new Logger(ClusterVNetService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepository: Repository<InfrastructureOperationEntity>,
    @InjectQueue('infrastructure') private readonly infrastructureQueue: Queue,
    private readonly providerFactory: ProviderFactory,
    private readonly vnetsService: VNetsService,
    private readonly subnetsService: SubnetsService,
  ) {}

  async attachClusterToVNet(
    clusterId: string,
    dto: UpdateClusterVNetDto,
  ): Promise<InfrastructureOperationEntity> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
      relations: ['nodes'],
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    if (!cluster.nodes || cluster.nodes.length === 0) {
      throw new BadRequestException(
        `Cluster ${clusterId} has no nodes to attach`,
      );
    }

    const provider = this.providerFactory.getProvider(
      cluster.provider as CloudProvider,
    );
    if (!provider.attachServerToVNet) {
      throw new BadRequestException(
        `Provider ${cluster.provider} does not support VNet attachment`,
      );
    }

    const existing = cluster.metadata?.vnetConfig;
    if (existing?.vnetId && existing.vnetId !== dto.vnetId) {
      throw new ConflictException(
        `Cluster ${clusterId} is already attached to VNet ${existing.vnetId}. ` +
          `Detach from the current VNet before attaching to a different one.`,
      );
    }

    const vnet = await this.vnetsService.getVNet(dto.vnetId);
    if (vnet.provider !== cluster.provider) {
      throw new BadRequestException(
        `VNet ${dto.vnetId} belongs to provider ${vnet.provider} ` +
          `but cluster uses ${cluster.provider}`,
      );
    }

    if (dto.subnetId) {
      const subnetMatch = vnet.subnets?.find((s) => s.id === dto.subnetId);
      if (!subnetMatch) {
        throw new BadRequestException(
          `Subnet ${dto.subnetId} does not belong to VNet ${dto.vnetId}`,
        );
      }
    } else if (!vnet.subnets || vnet.subnets.length === 0) {
      throw new BadRequestException(
        `VNet ${dto.vnetId} has no subnets — create one before attaching a cluster`,
      );
    }

    const vnetConfig = {
      vnetId: dto.vnetId,
      subnetId: dto.subnetId,
      autoAssignIp: dto.autoAssignIp !== false,
    };

    const operationSteps = getOperationSteps(
      OperationType.ATTACH_CLUSTER_TO_VNET,
      { nodeCount: cluster.nodes.length },
    );

    const operation = this.operationRepository.create({
      operationType: OperationType.ATTACH_CLUSTER_TO_VNET,
      status: OperationStatus.PENDING,
      resourceType: 'cluster',
      resourceName: cluster.name,
      resourceId: cluster.id,
      provider: cluster.provider,
      totalSteps: operationSteps.length,
      currentStepIndex: 0,
      currentStepProgress: 0,
      metadata: {
        vnetConfig,
        nodeCount: cluster.nodes.length,
        operationSteps,
        estimatedDurationInSeconds: 60 + cluster.nodes.length * 30,
      },
    });

    const savedOperation = await this.operationRepository.save(operation);

    const jobData: AttachClusterToVNetJobData = {
      operationId: savedOperation.id,
      clusterId: cluster.id,
      vnetConfig,
    };

    await this.infrastructureQueue.add('attach-cluster-to-vnet', jobData, {
      attempts: 1,
      timeout: 600000,
    });

    this.logger.log(
      `Queued attach-cluster-to-vnet for cluster ${cluster.id} ` +
        `(operation ${savedOperation.id}, ${cluster.nodes.length} nodes)`,
    );

    return savedOperation;
  }
}
