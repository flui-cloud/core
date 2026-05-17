import { ApiProperty } from '@nestjs/swagger';

export class BillingPeriodDto {
  @ApiProperty({ example: '2026-05-01T00:00:00.000Z' })
  start: string;

  @ApiProperty({ example: '2026-05-31T23:59:59.999Z' })
  end: string;

  @ApiProperty({ example: 744 })
  totalHours: number;

  @ApiProperty({ example: 288 })
  elapsedHours: number;
}

export class TrafficInfoDto {
  @ApiProperty({ example: 5368709120 })
  outgoingBytes: number;

  @ApiProperty({ example: 2147483648 })
  ingoingBytes: number;

  @ApiProperty({ example: 21990232555520 })
  includedBytes: number;

  @ApiProperty({ example: 0 })
  overageBytes: number;

  @ApiProperty({ example: '0.0000' })
  overageCostGross: string;

  @ApiProperty({ example: '0.0000' })
  overageCostNet: string;
}

export class NodeBillingSegmentDto {
  @ApiProperty({ example: 'cpx22' })
  serverType: string;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z' })
  startedAt: string;

  @ApiProperty({
    nullable: true,
    example: null,
    description: 'null = still active in this segment',
  })
  endedAt: string | null;

  @ApiProperty({ example: 312 })
  hours: number;

  @ApiProperty({ example: '5.2416' })
  costGross: string;

  @ApiProperty({ example: '4.3992' })
  costNet: string;
}

export class NodeMonthToDateDto {
  @ApiProperty()
  nodeId: string;

  @ApiProperty({ example: 'my-cluster-master-1' })
  serverName: string;

  @ApiProperty({ example: 'master', enum: ['master', 'worker'] })
  nodeType: string;

  @ApiProperty({ example: 'cpx22' })
  currentServerType: string;

  @ApiProperty({ nullable: true })
  providerResourceId: string | null;

  @ApiProperty({ example: 'active', enum: ['active', 'terminated'] })
  status: 'active' | 'terminated';

  @ApiProperty({
    description:
      'Total billable hours for this node in the current period — sum across all server-type segments (e.g. resize, autoscale churn).',
    example: 312,
  })
  billableHours: number;

  @ApiProperty({ example: '5.2416' })
  costGross: string;

  @ApiProperty({ example: '4.3992' })
  costNet: string;

  @ApiProperty({
    description:
      'Per-server-type breakdown. Each entry is a contiguous billable interval — useful to inspect the cost impact of a mid-month resize.',
    type: [NodeBillingSegmentDto],
  })
  segments: NodeBillingSegmentDto[];
}

export class VolumeMonthToDateDto {
  @ApiProperty({ example: '12345678' })
  volumeProviderId: string;

  @ApiProperty({
    example: 'shared-storage',
    enum: ['shared-storage', 'app-volume', 'snapshot'],
  })
  kind: string;

  @ApiProperty({ example: 20 })
  currentSizeGb: number;

  @ApiProperty({ example: 'active', enum: ['active', 'terminated'] })
  status: 'active' | 'terminated';

  @ApiProperty({ example: '0.2870' })
  costGross: string;

  @ApiProperty({ example: '0.2412' })
  costNet: string;
}

export class BillingBreakdownDto {
  @ApiProperty({ example: '12.3400' })
  computeGross: string;

  @ApiProperty({ example: '10.3700' })
  computeNet: string;

  @ApiProperty({ example: '0.5700' })
  storageGross: string;

  @ApiProperty({ example: '0.4790' })
  storageNet: string;

  @ApiProperty({ example: '0.0000' })
  trafficGross: string;

  @ApiProperty({ example: '0.0000' })
  trafficNet: string;
}

export class MonthToDateDto {
  @ApiProperty({
    description:
      'Total spent in the current billing period, including nodes already terminated. Compute + storage + traffic overage.',
    example: '12.9100',
  })
  totalGross: string;

  @ApiProperty({ example: '10.8490' })
  totalNet: string;

  @ApiProperty({ type: BillingBreakdownDto })
  breakdown: BillingBreakdownDto;

  @ApiProperty({ type: [NodeMonthToDateDto] })
  nodes: NodeMonthToDateDto[];

  @ApiProperty({ type: [VolumeMonthToDateDto] })
  volumes: VolumeMonthToDateDto[];

  @ApiProperty({ type: TrafficInfoDto })
  traffic: TrafficInfoDto;
}

export class RunRateDto {
  @ApiProperty({
    description:
      'Cost of running the current configuration (active nodes + active volumes) for a full month. Independent of how many hours have elapsed.',
    example: '21.4500',
  })
  monthlyGross: string;

  @ApiProperty({ example: '18.0252' })
  monthlyNet: string;

  @ApiProperty({ type: BillingBreakdownDto })
  breakdown: BillingBreakdownDto;

  @ApiProperty({ example: 3 })
  activeNodes: number;

  @ApiProperty({ example: 1 })
  activeVolumes: number;
}

export class ClusterBillingResponseDto {
  @ApiProperty()
  clusterId: string;

  @ApiProperty({ example: 'production-cluster' })
  clusterName: string;

  @ApiProperty({ example: 'hetzner' })
  provider: string;

  @ApiProperty({ example: 'fsn1' })
  region: string;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiProperty({ type: BillingPeriodDto })
  billingPeriod: BillingPeriodDto;

  @ApiProperty({ type: MonthToDateDto })
  monthToDate: MonthToDateDto;

  @ApiProperty({ type: RunRateDto })
  runRate: RunRateDto;

  @ApiProperty()
  calculatedAt: Date;
}
