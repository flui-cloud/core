import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ClusterEntity, ClusterStatus } from '../entities/cluster.entity';
import { CreateClusterDto } from '../dto/create-cluster.dto';
import { ManagementService } from '../../../management/services/management.service';

/**
 * Service responsible for cluster validation logic
 */
@Injectable()
export class ClusterValidationService {
  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly managementService: ManagementService,
  ) {}

  /**
   * Validate cluster creation request
   */
  async validateCreateClusterRequest(dto: CreateClusterDto): Promise<void> {
    // Check for duplicate cluster name (exclude deleted clusters)
    const existingCluster = await this.clusterRepository.findOne({
      where: {
        name: dto.name,
        status: Not(ClusterStatus.DELETED),
      },
    });

    if (existingCluster) {
      throw new ConflictException(
        `Cluster with name '${dto.name}' already exists`,
      );
    }

    // Validate node size
    await this.validateNodeSize(dto.provider, dto.region, dto.nodeSize);

    // Validate autoscaling configuration
    if (dto.autoscalingEnabled) {
      this.validateAutoscalingConfig(dto);
    }

    // Validate VNet configuration if provided
    if (dto.vnetConfig) {
      this.validateVNetConfig(dto);
    }
  }

  /**
   * Validate node size exists for provider/region
   * Accepts both name (e.g., 'cx22') and ID (e.g., '115')
   */
  private async validateNodeSize(
    provider: string,
    region: string,
    nodeSize: string,
  ): Promise<void> {
    const nodeSizes = await this.managementService.getNodeSizes(
      provider as any,
      region,
    );

    // Accept both name and ID for flexibility
    const validSize = nodeSizes.find(
      (size) => size.name === nodeSize || size.id === nodeSize,
    );

    if (!validSize) {
      throw new BadRequestException(
        `Node size '${nodeSize}' is not available for provider '${provider}' in region '${region}'`,
      );
    }
  }

  /**
   * Validate autoscaling configuration
   */
  private validateAutoscalingConfig(dto: CreateClusterDto): void {
    if (!dto.minNodes || !dto.maxNodes) {
      throw new BadRequestException(
        'Autoscaling enabled but minNodes or maxNodes not provided',
      );
    }

    if (dto.minNodes > dto.maxNodes) {
      throw new BadRequestException('minNodes cannot be greater than maxNodes');
    }

    if (dto.minNodes < 1) {
      throw new BadRequestException('minNodes must be at least 1');
    }

    if (dto.maxNodes > 20) {
      throw new BadRequestException('maxNodes cannot exceed 20');
    }
  }

  /**
   * Validate VNet configuration
   */
  private validateVNetConfig(dto: CreateClusterDto): void {
    if (!dto.vnetConfig.vnetId) {
      throw new BadRequestException('vnetConfig.vnetId is required');
    }

    // Additional VNet validations can be added here
    // For example, verify VNet exists and is in the same provider/region
  }
}
