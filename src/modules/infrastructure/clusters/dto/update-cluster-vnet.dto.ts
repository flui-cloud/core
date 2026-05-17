import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClusterVNetDto {
  @ApiProperty({
    description: 'VNet UUID to attach all cluster nodes to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  vnetId: string;

  @ApiPropertyOptional({
    description:
      'Specific subnet UUID within the VNet. If omitted, the first available subnet is used.',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsOptional()
  @IsUUID()
  subnetId?: string;

  @ApiPropertyOptional({
    description: 'Auto-assign private IPs to nodes (default: true).',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoAssignIp?: boolean;
}

export class AttachClusterToVNetResponseDto {
  @ApiProperty({ description: 'Operation ID for WebSocket subscription' })
  operationId: string;

  @ApiProperty({ description: 'Cluster ID' })
  clusterId: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({
    description:
      'Subscribe via WebSocket namespace /infrastructure with event subscribe:operation { operationId } to receive progress.',
    example: '/infrastructure',
  })
  websocketNamespace: string;
}
