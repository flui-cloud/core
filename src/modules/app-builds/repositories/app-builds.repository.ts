import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppBuildEntity } from '../entities/app-build.entity';
import { AppBuildStatus } from '../enums/app-build-status.enum';
import { BuildProvider } from '../enums/build-provider.enum';

const TERMINAL_STATUSES: AppBuildStatus[] = [
  AppBuildStatus.COMPLETED,
  AppBuildStatus.FAILED,
  AppBuildStatus.CANCELLED,
];

@Injectable()
export class AppBuildsRepository {
  constructor(
    @InjectRepository(AppBuildEntity)
    private readonly repo: Repository<AppBuildEntity>,
  ) {}

  async create(data: Partial<AppBuildEntity>): Promise<AppBuildEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: string): Promise<AppBuildEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByApplicationId(applicationId: string): Promise<AppBuildEntity[]> {
    return this.repo.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByApplicationId(
    applicationId: string,
  ): Promise<AppBuildEntity | null> {
    return this.repo.findOne({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatuses(statuses: AppBuildStatus[]): Promise<AppBuildEntity[]> {
    return this.repo.find({ where: statuses.map((status) => ({ status })) });
  }

  async findByClusterIdAndStatuses(
    buildClusterId: string,
    statuses: AppBuildStatus[],
  ): Promise<AppBuildEntity[]> {
    return this.repo.find({
      where: statuses.map((status) => ({ buildClusterId, status })),
      order: { createdAt: 'ASC' },
    });
  }

  async findCompletedByCommitSha(
    applicationId: string | null,
    commitSha: string,
  ): Promise<AppBuildEntity | null> {
    if (!applicationId) return null;
    return this.repo.findOne({
      where: { applicationId, commitSha, status: AppBuildStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestActiveByApplicationAndProvider(
    applicationId: string,
    provider: BuildProvider,
  ): Promise<AppBuildEntity | null> {
    return this.repo
      .createQueryBuilder('b')
      .where('b.applicationId = :applicationId', { applicationId })
      .andWhere('b.provider = :provider', { provider })
      .andWhere('b.status NOT IN (:...terminal)', {
        terminal: TERMINAL_STATUSES,
      })
      .orderBy('b.createdAt', 'DESC')
      .getOne();
  }

  async findByExternalRunId(
    provider: BuildProvider,
    externalRunId: string,
  ): Promise<AppBuildEntity | null> {
    return this.repo.findOne({
      where: { provider, externalRunId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<AppBuildEntity>): Promise<void> {
    await this.repo.update(id, data);
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async updateStatus(
    id: string,
    status: AppBuildStatus,
    errorMessage?: string,
  ): Promise<void> {
    const update: Partial<AppBuildEntity> = { status };
    if (errorMessage) {
      update.errorMessage = errorMessage;
    }
    if (
      status === AppBuildStatus.COMPLETED ||
      status === AppBuildStatus.FAILED ||
      status === AppBuildStatus.CANCELLED
    ) {
      update.completedAt = new Date();
    }
    await this.repo.update(id, update);
  }
}
