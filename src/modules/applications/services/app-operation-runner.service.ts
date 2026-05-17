import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InfrastructureOperationEntity,
  OperationStatus,
  OperationType,
} from '../../infrastructure/servers/entities/infrastructure-operations.entity';
import { ApplicationEventsGateway } from '../gateway/application-events.gateway';

export interface AppOperationContext {
  appId: string;
  operationType: OperationType;
  resourceName: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}

@Injectable()
export class AppOperationRunner {
  private readonly logger = new Logger(AppOperationRunner.name);

  constructor(
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepository: Repository<InfrastructureOperationEntity>,
    private readonly gateway: ApplicationEventsGateway,
  ) {}

  async run<T>(
    ctx: AppOperationContext,
    work: (op: InfrastructureOperationEntity) => Promise<T>,
  ): Promise<{ result: T; operationId: string }> {
    const op = this.operationRepository.create({
      operationType: ctx.operationType,
      status: OperationStatus.PENDING,
      resourceType: 'application',
      resourceName: ctx.resourceName,
      resourceId: ctx.appId,
      userId: ctx.userId,
      totalSteps: 1,
      currentStepIndex: 0,
      currentStepProgress: 0,
      metadata: { appId: ctx.appId, ...ctx.metadata },
    });
    const saved = await this.operationRepository.save(op);
    const startedAt = Date.now();

    saved.status = OperationStatus.IN_PROGRESS;
    saved.startedAt = new Date();
    await this.operationRepository.save(saved);
    this.gateway.emitOperationProgress(ctx.appId, {
      appId: ctx.appId,
      operationId: saved.id,
      operationType: ctx.operationType,
      percentage: 0,
      currentStep: 0,
      totalSteps: 1,
      message: `${ctx.operationType} started`,
      timestamp: new Date(),
    });

    try {
      const result = await work(saved);
      saved.status = OperationStatus.COMPLETED;
      saved.completedAt = new Date();
      saved.currentStepIndex = 1;
      saved.currentStepProgress = 100;
      saved.metadata = {
        ...saved.metadata,
        result: this.summarizeResult(result),
      };
      await this.operationRepository.save(saved);
      this.gateway.emitOperationCompleted(ctx.appId, {
        appId: ctx.appId,
        operationId: saved.id,
        operationType: ctx.operationType,
        duration: Date.now() - startedAt,
        timestamp: new Date(),
      });
      return { result, operationId: saved.id };
    } catch (err: any) {
      const message = err?.message ?? String(err);
      saved.status = OperationStatus.FAILED;
      saved.errorMessage = message;
      saved.completedAt = new Date();
      await this.operationRepository.save(saved);
      this.gateway.emitOperationFailed(ctx.appId, {
        appId: ctx.appId,
        operationId: saved.id,
        operationType: ctx.operationType,
        error: message,
        timestamp: new Date(),
      });
      throw err;
    }
  }

  private summarizeResult(result: unknown): unknown {
    if (result === null || result === undefined) return null;
    if (typeof result === 'object') {
      try {
        return structuredClone(result);
      } catch {
        return null;
      }
    }
    return result;
  }
}
