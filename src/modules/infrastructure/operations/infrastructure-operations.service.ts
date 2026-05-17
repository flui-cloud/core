import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InfrastructureOperationEntity,
  OperationStatus,
} from '../servers/entities/infrastructure-operations.entity';
import {
  calculateOperationProgressFromSaved,
  getStepConfigFromSaved,
} from './helpers/operation-steps.helper';

@Injectable()
export class InfrastructureOperationsService {
  constructor(
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepository: Repository<InfrastructureOperationEntity>,
  ) {}

  async getOperationDetails(
    operationId: string,
  ): Promise<InfrastructureOperationEntity> {
    const operation = await this.operationRepository.findOne({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation ${operationId} not found`);
    }

    return operation;
  }

  /**
   * Update operation step and recalculate progress
   * Uses saved steps from metadata for accurate progress tracking
   */
  async updateOperationStep(
    operationId: string,
    stepIndex: number,
    stepProgress: number = 0,
    additionalMetadata: Record<string, any> = {},
  ): Promise<void> {
    const operation = await this.operationRepository.findOne({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation ${operationId} not found`);
    }

    // Get saved steps from metadata
    const savedSteps = operation.metadata?.operationSteps || [];

    if (savedSteps.length === 0) {
      throw new Error(
        `No operation steps found in metadata for operation ${operationId}`,
      );
    }

    const stepConfig = getStepConfigFromSaved(savedSteps, stepIndex);
    if (!stepConfig) {
      throw new Error(
        `Invalid step index ${stepIndex} for operation type ${operation.operationType}`,
      );
    }

    // Calculate overall progress
    const overallProgress = calculateOperationProgressFromSaved(
      savedSteps,
      stepIndex,
      stepProgress,
    );

    // Update operation fields
    operation.currentStep = stepConfig.step;
    operation.currentStepIndex = stepIndex;
    operation.totalSteps = savedSteps.length;
    operation.currentStepProgress = stepProgress;
    operation.progress = overallProgress;

    // Handle status changes
    if (additionalMetadata.status) {
      operation.status = additionalMetadata.status;
      if (
        additionalMetadata.status === OperationStatus.IN_PROGRESS &&
        !operation.startedAt
      ) {
        operation.startedAt = new Date();
      }
      if (additionalMetadata.status === OperationStatus.COMPLETED) {
        operation.completedAt = new Date();
      }
    }

    // Update metadata
    operation.metadata = {
      ...operation.metadata,
      ...additionalMetadata,
      stepDescription: stepConfig.description,
      stepWeight: stepConfig.weight,
      lastUpdated: new Date().toISOString(),
    };

    await this.operationRepository.save(operation);
  }
}
