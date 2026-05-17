import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { CredentialType } from '../entities/credentials.entity';

export class ProviderCredentialsDto {
  @ApiProperty({ enum: CloudProvider })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({
    enum: CredentialType,
    description: 'Type of credentials to validate',
  })
  @IsEnum(CredentialType)
  type: CredentialType;

  // ── API Key (type: api_key) ──────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'API token — required when type is api_key',
  })
  @ValidateIf((o) => o.type === CredentialType.API_KEY)
  @IsNotEmpty()
  @IsString()
  apiKey?: string;

  // ── Access Key + Secret Key (type: access_key_secret) ───────────────────

  @ApiPropertyOptional({
    description:
      'Access Key ID — required when type is access_key_secret (e.g. Scaleway Access Key ID)',
  })
  @ValidateIf((o) => o.type === CredentialType.ACCESS_KEY_SECRET)
  @IsNotEmpty()
  @IsString()
  accessKey?: string;

  @ApiPropertyOptional({
    description:
      'Secret Key — required when type is access_key_secret (e.g. Scaleway Secret Key)',
  })
  @ValidateIf((o) => o.type === CredentialType.ACCESS_KEY_SECRET)
  @IsNotEmpty()
  @IsString()
  secretKey?: string;

  // ── Expiry (api_key and access_key_secret) ───────────────────────────────

  @ApiPropertyOptional({
    description:
      'Optional expiry date of the key. Cannot be inferred from the key itself — ' +
      'provide it if the key has an expiry set in the provider console. ISO 8601 format.',
    example: '2027-03-14T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  // ── User/Password (type: user_password) ─────────────────────────────────

  @ApiPropertyOptional({
    description: 'Username — required when type is user_password',
  })
  @ValidateIf((o) => o.type === CredentialType.USER_PASSWORD)
  @IsNotEmpty()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Password — required when type is user_password',
  })
  @ValidateIf((o) => o.type === CredentialType.USER_PASSWORD)
  @IsNotEmpty()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Client ID — required when type is user_password',
  })
  @ValidateIf((o) => o.type === CredentialType.USER_PASSWORD)
  @IsNotEmpty()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Client Secret — required when type is user_password',
  })
  @ValidateIf((o) => o.type === CredentialType.USER_PASSWORD)
  @IsNotEmpty()
  @IsString()
  clientSecret?: string;

  // ── Bearer Token (type: bearer_token) ───────────────────────────────────

  @ApiPropertyOptional({
    description: 'Bearer token — required when type is bearer_token',
  })
  @ValidateIf((o) => o.type === CredentialType.BEARER_TOKEN)
  @IsNotEmpty()
  @IsString()
  bearerToken?: string;
}
