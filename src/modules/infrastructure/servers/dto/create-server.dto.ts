import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { Label } from 'src/modules/providers/interfaces/cloud-provider.interface';

export class CreateServerDto {
  @ApiProperty({
    description: 'Name of the server',
    example: 'my-web-server',
    minLength: 1,
    maxLength: 63,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(63)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, {
    message:
      'Server name must contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen',
  })
  name: string;

  @ApiProperty({
    enum: CloudProvider,
    description: 'Cloud provider',
    example: CloudProvider.HETZNER,
  })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({
    description: 'Server type/size',
    example: 'cx22',
    default: 'cx22',
  })
  @IsString()
  server_type: string = 'cx22';

  @ApiProperty({
    description: 'Server location/datacenter',
    example: 'fsn1',
    default: 'fsn1',
  })
  @IsString()
  location: string = 'fsn1';

  @ApiPropertyOptional({
    description: 'Operating system image',
    example: 'ubuntu-22.04',
    default: 'ubuntu-22.04',
  })
  @IsOptional()
  @IsString()
  image?: string = 'ubuntu-22.04';

  @ApiPropertyOptional({
    description: 'SSH key names to add to the server',
    example: ['my-ssh-key', 'backup-key'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ssh_keys?: string[] = [];

  @ApiPropertyOptional({
    description: 'Network ID to attach the server to',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  network_id?: string;

  @ApiPropertyOptional({
    description: 'Enable IPv6',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enable_ipv6?: boolean = true;

  @ApiPropertyOptional({
    description: 'Environment tag',
    example: 'production',
    default: 'dev',
  })
  @IsOptional()
  @IsString()
  environment?: string = 'dev';

  @ApiPropertyOptional({
    description: 'Cluster name for grouping',
    example: 'web-cluster',
  })
  @IsOptional()
  @IsString()
  cluster_name?: string;

  user_data?: string; //Not exposed in API, used internally for cloud-init scripts
  uuid?: string;
  labels?: Label[]; // Not exposed in API, used internally by orchestration services
  firewalls?: string[]; // Not exposed in API, used internally for firewall attachment during cluster creation
  diskSizeGb?: number; // Not exposed in API, used internally for providers with network storage (e.g. Scaleway SBS)
  networks?: string[]; // Not exposed in API, used internally to attach the server to provider VNets at creation time
  /**
   * Flui-managed block storage Volumes created and attached at server
   * creation time. Used by §14 of the scaling architecture for the master's
   * NFS export backing Volume.
   */
  attachedVolumes?: {
    sizeGb: number;
    name: string;
    location?: string;
    labels?: Label[];
  }[];
}

export class CreateServerResponseDto {
  @ApiProperty({ description: 'Operation ID for tracking' })
  operation_id: string;

  @ApiProperty({ description: 'Current status' })
  status: 'pending' | 'running' | 'completed' | 'failed';

  @ApiProperty({ description: 'Resource type' })
  resource_type: 'server';

  @ApiProperty({ description: 'Cloud provider' })
  provider: CloudProvider;

  @ApiProperty({ description: 'Estimated completion time' })
  estimated_duration: string;

  @ApiPropertyOptional({ description: 'Created resource ID (when completed)' })
  resource_id?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;
}
