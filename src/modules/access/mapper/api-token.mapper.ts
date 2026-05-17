import { ApiTokenEntity } from '../entities/api-token.entity';
import { ApiTokenDto } from '../dto/api-token.dto';

export class ApiTokenMapper {
  static toDto(entity: ApiTokenEntity): ApiTokenDto {
    return {
      id: entity.id,
      provider: entity.provider,
      credential_type: entity.credential_type,
      label: entity.label,
      notes: entity.notes,
      expires_at: entity.expires_at ?? null,
      created_at: entity.created_at,
      last_used_at: entity.last_used_at,
    };
  }

  static toDtoList(entities: ApiTokenEntity[]): ApiTokenDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
