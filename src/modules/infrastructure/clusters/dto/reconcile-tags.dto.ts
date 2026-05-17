import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReconcileTagsDto {
  @ApiProperty({
    description: 'Force tag update even if server already has Flui tags',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  force?: boolean;

  @ApiProperty({
    description:
      'Include firewall reconciliation. When true (default), automatically discovers and reconciles firewall attachments',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  includeFirewalls?: boolean;
}

export class ReconcileTagsResponseDto {
  @ApiProperty({
    description: 'Whether the reconciliation was fully successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Number of nodes processed',
    example: 3,
  })
  nodesProcessed: number;

  @ApiProperty({
    description: 'Number of nodes that were updated',
    example: 2,
  })
  nodesUpdated: number;

  @ApiProperty({
    description: 'Array of error messages for nodes that failed',
    example: ['Node abc-123: Server not found on provider'],
    type: [String],
  })
  errors: string[];

  @ApiProperty({
    description:
      'Firewall reconciliation results (if includeFirewalls was true)',
    required: false,
  })
  firewallsReconciled?: {
    success: boolean;
    firewallsDiscovered: number;
    firewallsMatched: number;
    attachmentsCreated: number;
    errors: string[];
  };
}
