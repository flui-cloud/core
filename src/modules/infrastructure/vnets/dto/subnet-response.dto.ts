import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubnetType } from '../entities/vnet-subnet.entity';

export class SubnetResponseDto {
  @ApiProperty({
    description: 'Subnet UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'VNet UUID this subnet belongs to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  vnetId: string;

  @ApiPropertyOptional({
    description: 'Provider-specific subnet ID',
    example: '12345',
  })
  providerSubnetId?: string;

  @ApiProperty({
    description: 'Subnet IP range in CIDR notation',
    example: '10.0.1.0/24',
  })
  ipRange: string;

  @ApiProperty({
    description: 'Subnet type',
    enum: SubnetType,
    example: SubnetType.CLOUD,
  })
  type: SubnetType;

  @ApiProperty({
    description: 'Network zone where the subnet is located',
    example: 'eu-central',
  })
  networkZone: string;

  @ApiPropertyOptional({
    description: 'Gateway IP address for the subnet',
    example: '10.0.1.1',
  })
  gateway?: string;

  @ApiPropertyOptional({
    description: 'vSwitch ID (for vswitch type subnets)',
    example: '4711',
  })
  vswitchId?: string;

  @ApiProperty({
    description: 'List of server IDs attached to this subnet',
    type: [String],
    example: ['12345678', '87654321'],
  })
  attachedServerIds: string[];

  @ApiProperty({
    description: 'Subnet creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Subnet last update timestamp',
    example: '2024-01-15T11:00:00Z',
  })
  updatedAt: Date;
}

export class SubnetListResponseDto {
  @ApiProperty({
    description: 'List of subnets',
    type: [SubnetResponseDto],
  })
  subnets: SubnetResponseDto[];

  @ApiProperty({
    description: 'Total number of subnets',
    example: 5,
  })
  total: number;
}
