import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstanceEntity } from '../entities/instance.entity';
import { InstanceFiltersDto } from '../dto/instance-filters.dto';
import { IInstancesRepository } from '../interfaces/instances-repository.interface';

@Injectable()
export class DefaultInstancesRepository implements IInstancesRepository {
  constructor(
    @InjectRepository(InstanceEntity)
    private readonly instancesRepository: Repository<InstanceEntity>,
  ) {}

  async findAll(
    userId: string,
    filters?: InstanceFiltersDto,
  ): Promise<InstanceEntity[]> {
    const queryBuilder = this.instancesRepository
      .createQueryBuilder('instance')
      .where('instance.userId = :userId', { userId });

    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('instance.type = :type', { type: filters.type });
      }

      if (filters.status) {
        queryBuilder.andWhere('instance.status = :status', {
          status: filters.status,
        });
      }

      if (filters.provider) {
        queryBuilder.andWhere('instance.provider = :provider', {
          provider: filters.provider,
        });
      }

      if (filters.region) {
        queryBuilder.andWhere('instance.region = :region', {
          region: filters.region,
        });
      }

      if (filters.dataCenter) {
        queryBuilder.andWhere('instance.dataCenter = :dataCenter', {
          dataCenter: filters.dataCenter,
        });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(instance.name LIKE :search OR instance.displayName LIKE :search)',
          { search: `%${filters.search}%` },
        );
      }
    }

    return queryBuilder.getMany();
  }

  async findByProviderId(
    userId: string,
    providerId: string,
  ): Promise<InstanceEntity | null> {
    return this.instancesRepository.findOne({
      where: { providerId, userId },
    });
  }
}
