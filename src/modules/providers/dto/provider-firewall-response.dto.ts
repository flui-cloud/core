import { ApiProperty } from '@nestjs/swagger';

/**
 * Firewall rule as returned by the provider
 */
export class FirewallRuleResponseDto {
  @ApiProperty({
    description: 'Rule description',
    example: 'SSH access',
  })
  description: string;

  @ApiProperty({
    description: 'Traffic direction',
    enum: ['in', 'out'],
    example: 'in',
  })
  direction: 'in' | 'out';

  @ApiProperty({
    description: 'Network protocol',
    enum: ['tcp', 'udp', 'icmp'],
    example: 'tcp',
  })
  protocol: 'tcp' | 'udp' | 'icmp';

  @ApiProperty({
    description: 'Port or port range (optional for ICMP)',
    example: '22',
    required: false,
  })
  port?: string;

  @ApiProperty({
    description: 'Source IP CIDRs (for inbound rules)',
    type: [String],
    example: ['0.0.0.0/0', '::/0'],
    required: false,
  })
  sourceIps?: string[];

  @ApiProperty({
    description: 'Destination IP CIDRs (for outbound rules)',
    type: [String],
    example: ['0.0.0.0/0', '::/0'],
    required: false,
  })
  destinationIps?: string[];
}

/**
 * Server to which a firewall is applied
 */
export class AppliedServerDto {
  @ApiProperty({
    description: 'Provider server ID',
    example: '12345678',
  })
  serverId: string;

  @ApiProperty({
    description: 'Server name (if available)',
    example: 'my-cluster-node-1',
    required: false,
  })
  serverName?: string;
}

/**
 * Firewall details as returned by the cloud provider
 */
export class ProviderFirewallResponseDto {
  @ApiProperty({
    description: 'Provider firewall ID',
    example: '12345678',
  })
  id: string;

  @ApiProperty({
    description: 'Firewall name',
    example: 'flui-my-cluster-system-webapp',
  })
  name: string;

  @ApiProperty({
    description: 'Firewall rules',
    type: [FirewallRuleResponseDto],
  })
  rules: FirewallRuleResponseDto[];

  @ApiProperty({
    description: 'Firewall labels/tags',
    example: {
      'managed-by': 'flui-cloud',
      'flui-cluster-id': 'abc-123-def',
      'flui-resource-type': 'firewall',
    },
  })
  labels: Record<string, string>;

  @ApiProperty({
    description: 'Servers to which this firewall is applied',
    type: [AppliedServerDto],
  })
  appliedServers: AppliedServerDto[];
}
