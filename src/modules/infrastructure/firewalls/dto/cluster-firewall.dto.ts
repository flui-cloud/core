import {
  IsUUID,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FirewallRuleDto } from '../../../providers/dto/firewall.dto';
import { ReconciliationStatus } from '../entities/cluster-firewall.entity';
import { ClusterStatus } from '../../clusters/entities/cluster.entity';
import {
  NodeStatus,
  NodeType,
} from '../../clusters/entities/cluster-node.entity';

export enum FirewallCoverageStatus {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  ORPHANED = 'ORPHANED',
  UNKNOWN = 'UNKNOWN',
}

export class FirewallNodeInfoDto {
  @ApiProperty({ description: 'Cluster node ID' })
  nodeId: string;

  @ApiProperty({ description: 'Server name' })
  serverName: string;

  @ApiProperty({ description: 'Node type', enum: NodeType })
  nodeType: NodeType;

  @ApiProperty({ description: 'Node status', enum: NodeStatus })
  status: NodeStatus;

  @ApiPropertyOptional({ description: 'IP address of the node' })
  ipAddress?: string;
}

export class FirewallClusterInfoDto {
  @ApiProperty({ description: 'Cluster name' })
  clusterName: string;

  @ApiProperty({ description: 'Cluster status', enum: ClusterStatus })
  clusterStatus: ClusterStatus;

  @ApiProperty({ description: 'Total number of cluster nodes' })
  totalNodes: number;

  @ApiProperty({ description: 'Number of nodes in READY status' })
  readyNodes: number;

  @ApiProperty({ description: 'Cluster nodes', type: [FirewallNodeInfoDto] })
  nodes: FirewallNodeInfoDto[];
}

export class CreateClusterFirewallDto {
  @ApiProperty({ description: 'Cluster ID' })
  @IsUUID()
  clusterId: string;

  @ApiProperty({
    description: 'Desired firewall rules',
    type: [FirewallRuleDto],
    default: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FirewallRuleDto)
  desiredRules: FirewallRuleDto[];
}

export class UpdateFirewallRulesDto {
  @ApiProperty({
    description: 'Complete desired firewall rules (full replacement)',
    type: [FirewallRuleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FirewallRuleDto)
  desiredRules: FirewallRuleDto[];
}

export class FirewallResponseDto {
  @ApiProperty({ description: 'Firewall ID' })
  id: string;

  @ApiProperty({ description: 'Cluster ID' })
  clusterId: string;

  @ApiPropertyOptional({
    description: 'Provider firewall ID (e.g., Hetzner firewall ID)',
  })
  providerFirewallId?: string;

  @ApiProperty({
    description: 'Desired firewall rules',
    type: [FirewallRuleDto],
  })
  desiredRules: FirewallRuleDto[];

  @ApiPropertyOptional({
    description: 'Last successfully applied rules',
    type: [FirewallRuleDto],
  })
  lastAppliedRules?: FirewallRuleDto[];

  @ApiPropertyOptional({ description: 'Canonical hash of desired rules' })
  desiredHash?: string;

  @ApiPropertyOptional({ description: 'Hash of last applied rules' })
  lastAppliedHash?: string;

  @ApiProperty({
    description: 'Reconciliation status',
    enum: ReconciliationStatus,
  })
  reconciliationStatus: ReconciliationStatus;

  @ApiProperty({ description: 'Whether firewall has drift from desired state' })
  hasDrift: boolean;

  @ApiPropertyOptional({ description: 'Last reconciliation timestamp' })
  lastReconciliationAt?: Date;

  @ApiPropertyOptional({
    description: 'Error message if reconciliation failed',
  })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Firewall coverage status based on cluster node health',
    enum: FirewallCoverageStatus,
  })
  coverageStatus: FirewallCoverageStatus;

  @ApiPropertyOptional({
    description: 'Cluster node information for coverage assessment',
    type: FirewallClusterInfoDto,
  })
  clusterInfo?: FirewallClusterInfoDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<FirewallResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ReconciliationStatusDto {
  @ApiProperty({
    description: 'Current reconciliation status',
    enum: ReconciliationStatus,
  })
  @IsEnum(ReconciliationStatus)
  status: ReconciliationStatus;

  @ApiProperty({ description: 'Whether firewall has drift from desired state' })
  @IsBoolean()
  hasDrift: boolean;

  @ApiPropertyOptional({ description: 'Last reconciliation timestamp' })
  @IsOptional()
  lastReconciliationAt?: Date;

  @ApiPropertyOptional({
    description: 'Error message if reconciliation failed',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Desired rules hash' })
  @IsOptional()
  @IsString()
  desiredHash?: string;

  @ApiPropertyOptional({ description: 'Last applied rules hash' })
  @IsOptional()
  @IsString()
  lastAppliedHash?: string;
}

export class ListFirewallsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by cluster ID' })
  @IsOptional()
  @IsUUID()
  clusterId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reconciliation status',
    enum: ReconciliationStatus,
  })
  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;
}
