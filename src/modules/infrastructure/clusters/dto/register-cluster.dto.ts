import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  IsIP,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';

/**
 * DTO for registering an existing cluster (e.g., observability cluster)
 * into the database without creating new infrastructure.
 */
export class RegisterClusterDto {
  @ApiPropertyOptional({
    example: '8c441471-e304-4576-82d7-2878c26ffaf3',
    description:
      'CLI-generated cluster UUID. When provided, used as the database primary key ' +
      'so Loki/Prometheus log labels (cluster_id) match the DB ID directly. ' +
      'If omitted, a new UUID is auto-generated.',
  })
  @IsOptional()
  @IsUUID('4')
  clusterId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-5678-1234-90ab-cdef87654321',
    description:
      'CLI-generated node UUID for the master node. When provided, used as the ' +
      'node primary key so Loki log labels (server_id) match the DB ID directly. ' +
      'If omitted, a new UUID is auto-generated.',
  })
  @IsOptional()
  @IsUUID('4')
  nodeId?: string;

  @ApiProperty({
    example: 'observability-cluster-1767092311382',
    minLength: 3,
    maxLength: 63,
    description: 'Cluster name',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  name: string;

  @ApiProperty({
    enum: CloudProvider,
    example: CloudProvider.HETZNER,
    description: 'Cloud provider',
  })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({
    example: 'nbg1',
    description: 'Region/location code',
  })
  @IsString()
  region: string;

  @ApiProperty({
    example: 'cx22',
    description: 'Node size/type',
  })
  @IsString()
  nodeSize: string;

  @ApiProperty({
    example: '116.203.40.159',
    description: 'Master node IP address',
  })
  @IsString()
  @IsIP(4)
  masterIpAddress: string;

  @ApiProperty({
    example: '3+dAcRtOyMHPahOKvpk...',
    description: 'Encrypted K3s token (already encrypted)',
  })
  @IsString()
  k3sTokenEncrypted: string;

  @ApiPropertyOptional({
    example: 'v1.35.4+k3s1',
    description: 'K3s version',
  })
  @IsOptional()
  @IsString()
  k3sVersion?: string;

  @ApiPropertyOptional({
    example: 'ubuntu-24.04',
    description: 'OS image',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: {
      isObservabilityCluster: true,
      purpose: 'observability',
    },
    description: 'Cluster metadata.',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['ssh-key-id-1'],
    description: 'SSH key IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sshKeyIds?: string[];

  @ApiPropertyOptional({
    example: 'encrypted-kubeconfig-data...',
    description:
      'Encrypted kubeconfig (if not provided, will be fetched from master node)',
  })
  @IsOptional()
  @IsString()
  kubeconfigEncrypted?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description:
      'Provider resource ID for master node (if not provided, will be queried from provider API)',
  })
  @IsOptional()
  @IsString()
  masterProviderResourceId?: string;
}

/**
 * Response DTO for cluster registration
 */
export class RegisterClusterResponseDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: 'b9e2d4f1-5678-1234-90ab-cdef87654321',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Master node ID (use this for metrics API)',
    example: 'a1b2c3d4-5678-1234-90ab-cdef87654321',
  })
  node_id: string;

  @ApiProperty({
    description: 'Metrics API endpoint for this node',
    example: '/api/v1/servers/a1b2c3d4-5678-1234-90ab-cdef87654321/metrics',
  })
  metrics_endpoint: string;

  @ApiProperty({
    description: 'Registration status',
    example: 'registered',
  })
  status: string;
}
