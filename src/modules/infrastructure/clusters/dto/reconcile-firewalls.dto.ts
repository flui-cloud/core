import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReconcileFirewallsDto {
  @ApiProperty({
    description:
      'Force firewall reconciliation even if attachments already exist',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  force?: boolean;

  @ApiProperty({
    description:
      'Automatically match discovered firewalls to existing templates by comparing rules',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  autoMatchTemplates?: boolean;
}

export class FirewallReconciliationDetail {
  @ApiProperty({
    description: 'Provider firewall ID',
    example: '12345',
  })
  providerFirewallId: string;

  @ApiProperty({
    description: 'Firewall name',
    example: 'flui-cluster-observability-k3s',
  })
  name: string;

  @ApiProperty({
    description: 'Whether firewall was matched to a template',
    example: true,
  })
  matched: boolean;

  @ApiProperty({
    description: 'Template ID if matched',
    example: 'template-uuid',
    required: false,
  })
  templateId?: string;

  @ApiProperty({
    description: 'Template name if matched',
    example: 'K3s Cluster',
    required: false,
  })
  templateName?: string;
}

export class ReconcileFirewallsResponseDto {
  @ApiProperty({
    description: 'Whether the reconciliation was fully successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Number of firewalls discovered on provider',
    example: 2,
  })
  firewallsDiscovered: number;

  @ApiProperty({
    description: 'Number of firewalls matched to templates',
    example: 2,
  })
  firewallsMatched: number;

  @ApiProperty({
    description: 'Number of firewalls that could not be matched to templates',
    example: 0,
  })
  firewallsUnmatched: number;

  @ApiProperty({
    description: 'Number of attachment records created',
    example: 2,
  })
  attachmentsCreated: number;

  @ApiProperty({
    description: 'Array of error messages',
    example: [],
    type: [String],
  })
  errors: string[];

  @ApiProperty({
    description: 'Detailed information about each discovered firewall',
    type: [FirewallReconciliationDetail],
  })
  details: FirewallReconciliationDetail[];
}
