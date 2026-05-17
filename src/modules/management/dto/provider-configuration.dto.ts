import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderStatus } from '../entities/provider-status.enum';
import { ProviderRegion } from '../entities/provider-region.entity';
import { CredentialType } from '../entities/credentials.entity';

export class ProviderConfigurationDto {
  @ApiProperty({ description: 'Provider configuration ID' })
  id: string;

  @ApiProperty({ enum: CloudProvider, description: 'Cloud provider' })
  provider: CloudProvider;

  @ApiProperty({ enum: ProviderStatus, description: 'Provider status' })
  status: ProviderStatus;

  @ApiProperty({ description: 'Enabled regions', type: [String] })
  enabledRegions: string[];

  @ApiPropertyOptional({ description: 'Last health check timestamp' })
  lastHealthCheck?: Date;

  @ApiProperty({ description: 'Whether provider is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Available regions', type: [Object] })
  availableRegions?: ProviderRegion[];

  @ApiPropertyOptional({
    enum: CredentialType,
    description: 'Type of credentials currently stored for this provider',
  })
  credentialsType?: CredentialType;

  @ApiPropertyOptional({
    description:
      'Expiry of the stored credentials, if the user provided one. ISO 8601.',
  })
  credentialsExpiresAt?: Date | null;

  @ApiPropertyOptional({ description: 'Provider metadata' })
  metadata?: {
    apiKeyMasked?: string;
    lastValidation?: Date;
    errorMessage?: string;
    [key: string]: any;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
