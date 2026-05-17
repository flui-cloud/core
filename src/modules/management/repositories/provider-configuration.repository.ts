import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderConfigurationEntity } from '../entities/provider-configuration.entity';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderStatus } from '../entities/provider-status.enum';
import { IProviderConfigurationRepository } from '../interfaces/provider-configuration.repository.interface';

@Injectable()
export class ProviderConfigurationRepository
  implements IProviderConfigurationRepository
{
  constructor(
    @InjectRepository(ProviderConfigurationEntity)
    private readonly repository: Repository<ProviderConfigurationEntity>,
  ) {}

  async findAll(): Promise<ProviderConfigurationEntity[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByProvider(
    provider: CloudProvider,
  ): Promise<ProviderConfigurationEntity | null> {
    return this.repository.findOne({
      where: { provider },
    });
  }

  async findByStatus(
    status: ProviderStatus,
  ): Promise<ProviderConfigurationEntity[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveProviders(): Promise<ProviderConfigurationEntity[]> {
    return this.repository.find({
      where: {
        isActive: true,
        status: ProviderStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    config: Partial<ProviderConfigurationEntity>,
  ): Promise<ProviderConfigurationEntity> {
    const newConfig = this.repository.create(config);
    return this.repository.save(newConfig);
  }

  async update(
    id: string,
    updates: Partial<ProviderConfigurationEntity>,
  ): Promise<ProviderConfigurationEntity> {
    await this.repository.update(id, updates);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Provider configuration with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async updateHealthCheck(
    id: string,
    healthData: { lastHealthCheck: Date; metadata?: Record<string, any> },
  ): Promise<void> {
    const updateData: Partial<ProviderConfigurationEntity> = {
      lastHealthCheck: healthData.lastHealthCheck,
    };

    if (healthData.metadata) {
      const existing = await this.repository.findOne({ where: { id } });
      updateData.metadata = {
        ...existing?.metadata,
        ...healthData.metadata,
      };
    }

    await this.repository.update(id, updateData);
  }

  async findById(id: string): Promise<ProviderConfigurationEntity | null> {
    return this.repository.findOne({
      where: { id },
    });
  }
}
