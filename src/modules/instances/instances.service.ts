import { Injectable, Logger } from '@nestjs/common';
import { ProviderFactory } from '../providers/services/provider.factory';
import { InstanceFiltersDto } from './dto/instance-filters.dto';
import { InstanceEntity } from './entities/instance.entity';
import { CloudProvider } from '../providers/enums/cloud-provider.enum';
import {
  InstanceResponseDto,
  ProviderError,
} from './dto/instance-response.dto';
import { CacheService } from '../common/cache/cache.service';
import { CacheCategory } from '../common/cache/enums/cache-category.enum';
import { ProviderConfigurationRepository } from '../management/repositories/provider-configuration.repository';

@Injectable()
export class InstancesService {
  private readonly logger = new Logger(InstancesService.name);

  constructor(
    private readonly providerFactory: ProviderFactory,
    private readonly cacheService: CacheService,
    private readonly providerConfigRepo: ProviderConfigurationRepository,
  ) {}

  async listInstances(filters?: any): Promise<InstanceResponseDto> {
    const skipCache =
      filters?.skipCache === true || filters?.skipCache === 'true';

    const cacheKey = this.cacheService.buildKey(
      'instances',
      filters?.provider || 'all',
      filters?.clusterId || 'no-cluster',
      filters?.type || 'all',
      filters?.status || 'all',
    );

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const allInstances: InstanceEntity[] = [];
        const errors: ProviderError[] = [];

        if (filters?.provider) {
          try {
            const provider = this.providerFactory.getProvider(filters.provider);
            const instances = await provider.listInstances(filters);
            allInstances.push(...instances);
          } catch (error) {
            this.logger.error(
              `Error fetching ${filters.provider} instances: ${error.message}`,
            );
            errors.push(
              new ProviderError(
                filters.provider,
                error.message || 'Unknown error',
              ),
            );
          }
        } else {
          const activeProviders = await this.getActiveConfiguredProviders();

          const instancePromises = activeProviders.map(async (providerType) => {
            try {
              const provider = this.providerFactory.getProvider(providerType);
              const instances = await provider.listInstances(filters);
              return { instances, error: null };
            } catch (error) {
              this.logger.error(
                `Error fetching ${providerType} instances: ${error.message}`,
              );
              return {
                instances: [],
                error: new ProviderError(
                  providerType,
                  error.message || 'Unknown error',
                ),
              };
            }
          });

          const results = await Promise.all(instancePromises);

          results.forEach((result) => {
            if (result.instances.length > 0) {
              allInstances.push(...result.instances);
            }
            if (result.error) {
              errors.push(result.error);
            }
          });
        }

        const filteredInstances = this.applyFilters(allInstances, filters);

        return new InstanceResponseDto(filteredInstances, errors);
      },
      {
        category: CacheCategory.OPERATIONAL,
        skipCache,
        // Don't cache if there are errors from any provider
        shouldCache: (result: InstanceResponseDto) => {
          return !result.partialErrors || result.partialErrors.length === 0;
        },
      },
    );
  }

  private async getActiveConfiguredProviders(): Promise<CloudProvider[]> {
    const activeConfigs = await this.providerConfigRepo.findActiveProviders();
    return activeConfigs.map((config) => config.provider);
  }

  private applyFilters(
    instances: InstanceEntity[],
    filters?: InstanceFiltersDto,
  ): InstanceEntity[] {
    if (!filters) {
      return instances;
    }

    return instances.filter((instance) => {
      if (filters.type && instance.type !== filters.type) {
        return false;
      }

      if (filters.status && instance.status !== filters.status) {
        return false;
      }

      if (filters.region && instance.region !== filters.region) {
        return false;
      }

      if (filters.dataCenter && instance.dataCenter !== filters.dataCenter) {
        return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameLower = instance.name.toLowerCase();
        const displayNameLower = instance.displayName?.toLowerCase() || '';

        if (
          !nameLower.includes(searchLower) &&
          !displayNameLower.includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }
}
