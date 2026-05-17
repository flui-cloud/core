import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { VNetStatus } from '../entities/vnet.entity';

export class VNetSubnetResponseDto {
  @ApiProperty({ description: 'Subnet ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Provider-specific subnet ID' })
  providerSubnetId?: string;

  @ApiProperty({ description: 'Subnet IP range' })
  ipRange: string;

  @ApiProperty({ description: 'Network zone' })
  networkZone: string;

  @ApiPropertyOptional({ description: 'Gateway IP address' })
  gateway?: string;

  @ApiPropertyOptional({ description: 'vSwitch ID' })
  vswitchId?: string;

  @ApiProperty({
    description: 'List of server IDs attached to this subnet',
    type: [String],
    example: ['12345678', '87654321'],
  })
  attachedServerIds: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class VNetRouteResponseDto {
  @ApiProperty({ description: 'Route ID' })
  id: string;

  @ApiProperty({ description: 'Destination IP range' })
  destination: string;

  @ApiProperty({ description: 'Gateway IP address' })
  gateway: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class VNetResponseDto {
  @ApiProperty({ description: 'VNet ID' })
  id: string;

  @ApiProperty({ description: 'Provider resource ID' })
  providerResourceId: string;

  @ApiProperty({ description: 'VNet name' })
  name: string;

  @ApiProperty({ description: 'Cloud provider', enum: CloudProvider })
  provider: CloudProvider;

  @ApiProperty({ description: 'VNet IP range' })
  ipRange: string;

  @ApiProperty({
    description: 'Labels',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: 'string' },
      },
    },
  })
  labels: Array<{ key: string; value: string }>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'VNet status', enum: VNetStatus })
  status: VNetStatus;

  @ApiProperty({
    description: 'Subnets',
    type: [VNetSubnetResponseDto],
  })
  subnets: VNetSubnetResponseDto[];

  @ApiProperty({
    description: 'Routes',
    type: [VNetRouteResponseDto],
  })
  routes: VNetRouteResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class VNetListResponseDto {
  @ApiProperty({
    description: 'List of VNets',
    type: [VNetResponseDto],
  })
  vnets: VNetResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;
}
