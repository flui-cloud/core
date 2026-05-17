import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TopologyAppCategory,
  TopologyAppKind,
  TopologyAppStatus,
  TopologyHealthStatus,
  TopologyScalingMode,
  TopologyServerRole,
} from '../enums/topology.enums';

export class TopologyServerSpecsDto {
  @ApiProperty({ example: 4 })
  cpuCores: number;

  @ApiProperty({ example: 8192 })
  memoryMB: number;

  @ApiProperty({ example: 80 })
  storageGB: number;
}

export class TopologyServerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ enum: TopologyServerRole })
  role: TopologyServerRole;

  @ApiProperty({ enum: TopologyHealthStatus })
  status: TopologyHealthStatus;

  @ApiProperty({ type: TopologyServerSpecsDto })
  specs: TopologyServerSpecsDto;
}

export class TopologyAppReplicaDto {
  @ApiProperty()
  serverId: string;

  @ApiProperty({ example: 1 })
  count: number;
}

export class TopologyAppDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'Pre-computed short label, max 14 chars' })
  slug: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ enum: TopologyAppCategory })
  category: TopologyAppCategory;

  @ApiProperty({ enum: TopologyAppKind })
  kind: TopologyAppKind;

  @ApiProperty()
  namespace: string;

  @ApiProperty({ enum: TopologyAppStatus })
  status: TopologyAppStatus;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'CrashLoopBackOff',
  })
  statusReason: string | null;

  @ApiProperty()
  ramRequestMB: number;

  @ApiProperty()
  ramLimitMB: number;

  @ApiProperty({ description: 'CPU request in millicores' })
  cpuRequestM: number;

  @ApiProperty({ description: 'CPU limit in millicores' })
  cpuLimitM: number;

  @ApiProperty({
    description: 'Server hosting the leader/primary planet for rendering',
  })
  primaryServerId: string;

  @ApiProperty({ type: [TopologyAppReplicaDto] })
  replicas: TopologyAppReplicaDto[];

  @ApiProperty({
    description: 'Sum of replicas[].count, denormalized for the client',
  })
  replicaCount: number;

  @ApiProperty({ enum: TopologyScalingMode })
  scalingMode: TopologyScalingMode;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: 'HPA · 4 replicas',
  })
  scalingNote: string | null;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  labels: Record<string, string>;
}

export class TopologyClusterDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ example: 'hetzner' })
  provider: string;

  @ApiProperty({ example: 'fsn1' })
  region: string;

  @ApiProperty({ enum: TopologyHealthStatus })
  status: TopologyHealthStatus;

  @ApiProperty({ type: [TopologyServerDto] })
  servers: TopologyServerDto[];

  @ApiProperty({ type: [TopologyAppDto] })
  apps: TopologyAppDto[];
}

export class TopologyStatsDto {
  @ApiProperty()
  totalClusters: number;

  @ApiProperty()
  totalServers: number;

  @ApiProperty()
  totalApps: number;

  @ApiProperty()
  totalReplicas: number;

  @ApiProperty()
  totalRamMB: number;

  @ApiProperty({ description: 'Apps with status=error' })
  errorCount: number;

  @ApiProperty({ description: 'Apps with status=warning' })
  warningCount: number;
}

export class TopologyResponseDto {
  @ApiProperty({ example: '1' })
  version: '1';

  @ApiProperty({ example: '2026-05-10T12:00:00.000Z' })
  fetchedAt: string;

  @ApiProperty({ type: [TopologyClusterDto] })
  clusters: TopologyClusterDto[];

  @ApiProperty({ type: TopologyStatsDto })
  stats: TopologyStatsDto;
}
