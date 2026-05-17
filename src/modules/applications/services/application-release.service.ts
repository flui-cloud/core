import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  InfrastructureOperationEntity,
  OperationStatus,
  OperationType,
} from '../../infrastructure/servers/entities/infrastructure-operations.entity';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { ApplicationReleaseDto } from '../dto/application-release.dto';
import { ReleaseStatus } from '../enums/release-status.enum';
import { ApplicationEventsGateway } from '../gateway/application-events.gateway';

type ReleaseMetadata = {
  imageRef?: string;
  digest?: string;
  previousImageRef?: string;
  buildId?: string;
  failureReason?: string;
  releaseStatus?: ReleaseStatus;
};

const RELEASE_OPERATION_TYPES: OperationType[] = [
  OperationType.DEPLOY_APPLICATION,
  OperationType.ROLLBACK_APPLICATION,
];

@Injectable()
export class ApplicationReleaseService {
  private readonly logger = new Logger(ApplicationReleaseService.name);

  constructor(
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepository: Repository<InfrastructureOperationEntity>,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly eventsGateway: ApplicationEventsGateway,
  ) {}

  async getCurrentRelease(
    applicationId: string,
  ): Promise<ApplicationReleaseDto | null> {
    const op = await this.operationRepository.findOne({
      where: {
        resourceId: applicationId,
        operationType: In(RELEASE_OPERATION_TYPES),
      },
      order: { createdAt: 'DESC' },
    });
    return op ? this.toDto(op) : null;
  }

  async listReleases(
    applicationId: string,
    limit = 20,
  ): Promise<ApplicationReleaseDto[]> {
    const ops = await this.operationRepository.find({
      where: {
        resourceId: applicationId,
        operationType: In(RELEASE_OPERATION_TYPES),
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return ops.map((o) => this.toDto(o));
  }

  /**
   * Called by the reconciler when it detects a stuck rollout
   * (Progressing=False / ProgressDeadlineExceeded). Marks the latest deploy
   * operation as FAILED and emits the release WS event. No-op if the latest
   * release is already terminal — failure has already been recorded.
   */
  async markCurrentReleaseFailed(
    applicationId: string,
    failureReason: string,
  ): Promise<ApplicationReleaseDto | null> {
    const op = await this.operationRepository.findOne({
      where: {
        resourceId: applicationId,
        operationType: In(RELEASE_OPERATION_TYPES),
      },
      order: { createdAt: 'DESC' },
    });
    if (!op) return null;

    const metadata = (op.metadata as ReleaseMetadata) ?? {};
    const alreadyFailedWithSameReason =
      op.status === OperationStatus.FAILED &&
      metadata.failureReason === failureReason;
    if (alreadyFailedWithSameReason) {
      return this.toDto(op);
    }

    op.status = OperationStatus.FAILED;
    op.metadata = { ...metadata, failureReason } as typeof op.metadata;
    op.completedAt = op.completedAt ?? new Date();
    await this.operationRepository.save(op);

    const dto = this.toDto(op);
    this.eventsGateway.emitReleaseStatusChanged(applicationId, {
      appId: applicationId,
      operationId: op.id,
      status: dto.status,
      imageRef: dto.imageRef ?? null,
      previousImageRef: dto.previousImageRef ?? null,
      buildId: dto.buildId ?? null,
      failureReason: dto.failureReason ?? null,
      timestamp: new Date(),
    });
    return dto;
  }

  /**
   * Marks an existing release operation as ROLLED_BACK once a rollback
   * operation completes successfully against the same app. Stored as a
   * dedicated metadata flag so it survives an eventual reconciler rerun.
   */
  async markReleaseRolledBack(operationId: string): Promise<void> {
    const op = await this.operationRepository.findOne({
      where: { id: operationId },
    });
    if (!op) return;
    const metadata = (op.metadata as ReleaseMetadata) ?? {};
    op.metadata = {
      ...metadata,
      releaseStatus: ReleaseStatus.ROLLED_BACK,
    } as typeof op.metadata;
    await this.operationRepository.save(op);

    const dto = this.toDto(op);
    this.eventsGateway.emitReleaseStatusChanged(op.resourceId, {
      appId: op.resourceId,
      operationId: op.id,
      status: dto.status,
      imageRef: dto.imageRef ?? null,
      previousImageRef: dto.previousImageRef ?? null,
      buildId: dto.buildId ?? null,
      failureReason: dto.failureReason ?? null,
      timestamp: new Date(),
    });
  }

  async assertApplicationExists(applicationId: string): Promise<void> {
    const app = await this.applicationsRepository.findById(applicationId);
    if (!app) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }
  }

  private toDto(op: InfrastructureOperationEntity): ApplicationReleaseDto {
    const metadata = (op.metadata as ReleaseMetadata) ?? {};
    const imageRef = metadata.imageRef ?? null;
    return {
      applicationId: op.resourceId ?? '',
      operationId: op.id,
      status: this.deriveStatus(op, metadata),
      imageRef,
      digest: metadata.digest ?? this.extractDigestFromImageRef(imageRef),
      previousImageRef: metadata.previousImageRef ?? null,
      buildId: metadata.buildId ?? null,
      failureReason: metadata.failureReason ?? null,
      startedAt: op.createdAt,
      completedAt: op.completedAt ?? null,
    };
  }

  private extractDigestFromImageRef(
    imageRef: string | null | undefined,
  ): string | null {
    if (!imageRef) return null;
    const at = imageRef.lastIndexOf('@');
    if (at < 0) return null;
    const rest = imageRef.slice(at + 1);
    return /^sha256:[0-9a-f]{64}$/.test(rest) ? rest : null;
  }

  private deriveStatus(
    op: InfrastructureOperationEntity,
    metadata: ReleaseMetadata,
  ): ReleaseStatus {
    if (metadata.releaseStatus) return metadata.releaseStatus;
    switch (op.status) {
      case OperationStatus.PENDING:
      case OperationStatus.IN_PROGRESS:
        return ReleaseStatus.IN_PROGRESS;
      case OperationStatus.COMPLETED:
        return op.operationType === OperationType.ROLLBACK_APPLICATION
          ? ReleaseStatus.ROLLED_BACK
          : ReleaseStatus.SUCCEEDED;
      case OperationStatus.FAILED:
      case OperationStatus.CANCELLED:
      default:
        return ReleaseStatus.FAILED;
    }
  }
}
