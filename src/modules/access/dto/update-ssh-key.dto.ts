import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsArray, IsEnum } from 'class-validator';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';

export class UpdateSSHKeyDto {
  @ApiProperty({
    description:
      'Key-value pairs for tagging. Values can be strings or arrays. This will replace all existing tags',
    example: {
      'cluster-id': ['k3s-prod-eu-001', 'k3s-prod-eu-002'],
      'cluster-node-id': 'node-worker-03',
      roles: ['master', 'worker'],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  tags?: Record<string, string | string[]>;

  @ApiPropertyOptional({
    description: 'Mapping of cloud provider to provider-specific SSH key IDs',
    example: {
      HETZNER: '12345',
      CONTABO: 'abc-def',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  providerKeyMappings?: Record<string, string>;

  @ApiPropertyOptional({
    description:
      'List of cloud providers to sync this SSH key to. ' +
      'Triggers actual key creation on each specified provider and updates providerKeyMappings. ' +
      'Use this to push an existing key to providers it was not originally synced to.',
    enum: CloudProvider,
    isArray: true,
    example: [CloudProvider.SCALEWAY],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CloudProvider, { each: true })
  syncProviders?: CloudProvider[];

  @ApiPropertyOptional({
    description:
      'List of cloud providers to remove this SSH key from. ' +
      'Deletes the key on each specified provider and clears the mapping from providerKeyMappings. ' +
      'The key is NOT deleted from the local database.',
    enum: CloudProvider,
    isArray: true,
    example: [CloudProvider.SCALEWAY],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CloudProvider, { each: true })
  unsyncProviders?: CloudProvider[];
}
