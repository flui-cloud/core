import { ProviderConfigurationEntity } from '../entities/provider-configuration.entity';
import { ProviderConfigurationDto } from '../dto/provider-configuration.dto';

export class ProviderConfigurationMapper {
  static toDto(entity: ProviderConfigurationEntity): ProviderConfigurationDto {
    return {
      id: entity.id,
      provider: entity.provider,
      status: entity.status,
      enabledRegions: entity.enabledRegions,
      lastHealthCheck: entity.lastHealthCheck,
      isActive: entity.isActive,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDtoList(
    entities: ProviderConfigurationEntity[],
  ): ProviderConfigurationDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  static toEntity(
    dto: Partial<ProviderConfigurationDto>,
  ): Partial<ProviderConfigurationEntity> {
    return {
      provider: dto.provider,
      status: dto.status,
      enabledRegions: dto.enabledRegions,
      isActive: dto.isActive,
      metadata: dto.metadata,
    };
  }
}
