import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CredentialType } from '../../management/entities/credentials.entity';

export class ApiTokenDto {
  @ApiProperty({
    description: 'Unique token ID',
    example: '6f103ec7-8b23-4c97-b0e8-9d9e5dba8382',
  })
  id: string;

  @ApiProperty({
    description: 'Cloud provider',
    example: 'hetzner',
  })
  provider: string;

  @ApiProperty({
    description: 'Credential type',
    enum: CredentialType,
    example: CredentialType.API_KEY,
  })
  credential_type: CredentialType;

  @ApiProperty({
    description: 'Label for this credential',
    example: 'Production Hetzner Account',
  })
  label: string;

  @ApiPropertyOptional({
    description: 'Notes about this credential',
    example: 'Used for infrastructure in EU region',
  })
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Expiry date of the key, if set by the user at registration time',
    example: '2027-03-14T00:00:00.000Z',
  })
  expires_at?: Date | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-03-10T14:30:00Z',
  })
  created_at: Date;

  @ApiPropertyOptional({
    description: 'Last time the credential was used',
    example: '2023-03-15T09:45:22Z',
  })
  last_used_at?: Date | null;
}
