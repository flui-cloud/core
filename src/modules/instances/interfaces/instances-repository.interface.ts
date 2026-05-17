import { InstanceEntity } from '../entities/instance.entity';
import { InstanceFiltersDto } from '../dto/instance-filters.dto';

export interface IInstancesRepository {
  findAll(
    userId: string,
    filters?: InstanceFiltersDto,
  ): Promise<InstanceEntity[]>;
  findByProviderId(
    userId: string,
    providerId: string,
  ): Promise<InstanceEntity | null>;
}
