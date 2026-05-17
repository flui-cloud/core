import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  IsNull,
  Not,
  Repository as TypeOrmRepository,
} from 'typeorm';
import { AppRevisionEntity } from '../entities/app-revision.entity';
import { AppEventType, AppEventActor } from '../enums/app-event-type.enum';
import { ApplicationStatus } from '../enums/application-status.enum';
import {
  ApplicationSourceConfig,
  ApplicationEnvVar,
  ApplicationResources,
} from '../interfaces/source-config.interface';

export interface CreateAuditEventData {
  applicationId: string;
  eventType: AppEventType;
  actor?: AppEventActor;
  changeMetadata?: Record<string, unknown>;
  // Deploy/Rollback specific
  revisionNumber?: number;
  imageRef?: string;
  commitSha?: string;
  chartVersion?: string;
  sourceConfigSnapshot?: ApplicationSourceConfig;
  envSnapshot?: ApplicationEnvVar[];
  resourcesSnapshot?: ApplicationResources;
  replicas?: number;
  status?: ApplicationStatus;
  errorMessage?: string;
  deployedBy?: string;
  operationId?: string;
  buildId?: string | null;
  k8sResourceHashes?: Record<string, string>;
  rollbackReason?: string;
}

@Injectable()
export class AppRevisionsRepository {
  constructor(
    @InjectRepository(AppRevisionEntity)
    private readonly repository: TypeOrmRepository<AppRevisionEntity>,
  ) {}

  async create(data: Partial<AppRevisionEntity>): Promise<AppRevisionEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async createAuditEvent(
    data: CreateAuditEventData,
  ): Promise<AppRevisionEntity> {
    const entity = this.repository.create({
      applicationId: data.applicationId,
      eventType: data.eventType,
      actor: data.actor ?? null,
      changeMetadata: data.changeMetadata ?? {},
      revisionNumber: data.revisionNumber ?? null,
      imageRef: data.imageRef,
      commitSha: data.commitSha,
      chartVersion: data.chartVersion,
      sourceConfigSnapshot:
        data.sourceConfigSnapshot ?? ({} as ApplicationSourceConfig),
      envSnapshot: data.envSnapshot ?? [],
      resourcesSnapshot: data.resourcesSnapshot ?? ({} as ApplicationResources),
      replicas: data.replicas,
      status: data.status ?? ApplicationStatus.RUNNING,
      errorMessage: data.errorMessage,
      deployedBy: data.deployedBy,
      operationId: data.operationId,
      buildId: data.buildId ?? null,
      k8sResourceHashes: data.k8sResourceHashes ?? {},
      rollbackReason: data.rollbackReason,
    });
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<AppRevisionEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<AppRevisionEntity>,
  ): Promise<AppRevisionEntity | null> {
    return this.repository.findOne(options);
  }

  async findByApplicationId(
    applicationId: string,
  ): Promise<AppRevisionEntity[]> {
    return this.repository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  // Returns only DEPLOY and ROLLBACK events (numbered revisions), ordered by revisionNumber DESC
  async findDeployRevisions(
    applicationId: string,
  ): Promise<AppRevisionEntity[]> {
    return this.repository.find({
      where: [
        { applicationId, eventType: AppEventType.DEPLOY },
        { applicationId, eventType: AppEventType.ROLLBACK },
      ],
      order: { revisionNumber: 'DESC' },
    });
  }

  // Returns all audit events ordered by createdAt DESC with optional pagination
  async findAllEvents(
    applicationId: string,
    options?: {
      eventType?: AppEventType;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ events: AppRevisionEntity[]; total: number }> {
    const where: Record<string, unknown> = { applicationId };
    if (options?.eventType) {
      where['eventType'] = options.eventType;
    }

    const [events, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return { events, total };
  }

  async findByApplicationIdAndRevisionNumber(
    applicationId: string,
    revisionNumber: number,
  ): Promise<AppRevisionEntity | null> {
    return this.repository.findOne({
      where: { applicationId, revisionNumber },
    });
  }

  async getLatestRevision(
    applicationId: string,
  ): Promise<AppRevisionEntity | null> {
    return this.repository.findOne({
      where: {
        applicationId,
        revisionNumber: Not(IsNull()),
      },
      order: { revisionNumber: 'DESC' },
    });
  }

  async getNextRevisionNumber(applicationId: string): Promise<number> {
    const latest = await this.getLatestRevision(applicationId);
    return latest ? (latest.revisionNumber ?? 0) + 1 : 1;
  }

  async update(
    id: string,
    data: Partial<AppRevisionEntity>,
  ): Promise<AppRevisionEntity> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
