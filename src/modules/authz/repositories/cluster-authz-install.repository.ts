import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterAuthzInstallEntity } from '../entities/cluster-authz-install.entity';
import { AuthzInstallStatus } from '../enums/authz-install-status.enum';

@Injectable()
export class ClusterAuthzInstallRepository {
  constructor(
    @InjectRepository(ClusterAuthzInstallEntity)
    private readonly repo: Repository<ClusterAuthzInstallEntity>,
  ) {}

  async findById(id: string): Promise<ClusterAuthzInstallEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<ClusterAuthzInstallEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByClusterId(
    clusterId: string,
  ): Promise<ClusterAuthzInstallEntity | null> {
    return this.repo.findOne({
      where: { clusterId },
      order: { createdAt: 'DESC' },
    });
  }

  async findRunningForCluster(
    clusterId: string,
  ): Promise<ClusterAuthzInstallEntity | null> {
    return this.repo.findOne({
      where: { clusterId, status: AuthzInstallStatus.RUNNING },
    });
  }

  async create(
    data: Partial<ClusterAuthzInstallEntity>,
  ): Promise<ClusterAuthzInstallEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ClusterAuthzInstallEntity>,
  ): Promise<void> {
    await this.repo.update(id, data);
  }
}
