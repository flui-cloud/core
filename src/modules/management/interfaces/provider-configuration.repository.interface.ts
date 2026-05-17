import { ProviderConfigurationEntity } from '../entities/provider-configuration.entity';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderStatus } from '../entities/provider-status.enum';

export interface IProviderConfigurationRepository {
  findAll(): Promise<ProviderConfigurationEntity[]>;
  findByProvider(
    provider: CloudProvider,
  ): Promise<ProviderConfigurationEntity | null>;
  findById(id: string): Promise<ProviderConfigurationEntity | null>;
  findByStatus(status: ProviderStatus): Promise<ProviderConfigurationEntity[]>;
  findActiveProviders(): Promise<ProviderConfigurationEntity[]>;
  create(
    config: Partial<ProviderConfigurationEntity>,
  ): Promise<ProviderConfigurationEntity>;
  update(
    id: string,
    updates: Partial<ProviderConfigurationEntity>,
  ): Promise<ProviderConfigurationEntity>;
  delete(id: string): Promise<void>;
  updateHealthCheck(
    id: string,
    healthData: { lastHealthCheck: Date; metadata?: Record<string, any> },
  ): Promise<void>;
}
