import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CapacityMasterDto {
  @ApiProperty()
  nodeName: string;

  @ApiProperty({ description: 'Provider server type (e.g. cx22, DEV1-S)' })
  serverType: string;

  @ApiProperty({ description: 'Allocatable CPU in millicores' })
  allocatableCpuMillicores: number;

  @ApiProperty({ description: 'Allocatable memory in MiB' })
  allocatableMemoryMi: number;

  @ApiProperty({
    description: 'Sum of pod CPU requests on master in millicores',
  })
  usedCpuMillicores: number;

  @ApiProperty({ description: 'Sum of pod memory requests on master in MiB' })
  usedMemoryMi: number;

  @ApiProperty()
  freeCpuMillicores: number;

  @ApiProperty()
  freeMemoryMi: number;

  @ApiPropertyOptional({
    description: 'Monthly cost of current server type in EUR (net)',
  })
  monthlyCostEur?: string;
}

export class CapacityCandidateDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['upgrade', 'downgrade', 'current'] })
  direction: 'upgrade' | 'downgrade' | 'current';

  @ApiProperty({ description: 'Cores' })
  cores: number;

  @ApiProperty({ description: 'Memory in GB' })
  memoryGb: number;

  @ApiProperty({ description: 'Local disk in GB' })
  diskGb: number;

  @ApiProperty({ description: 'Monthly price EUR (net)' })
  monthlyCostEur: string;

  @ApiProperty({
    description:
      'Monthly price delta vs current type in EUR (net). Negative = cheaper.',
  })
  monthlyDeltaEur: string;

  @ApiProperty({ enum: ['shared', 'dedicated'] })
  cpuType: 'shared' | 'dedicated';

  @ApiProperty({ description: 'True if deprecated by the provider' })
  deprecated: boolean;
}

export class CapacityStorageDto {
  @ApiProperty()
  volumeId: string;

  @ApiProperty()
  sizeGb: number;

  @ApiPropertyOptional({
    description: 'Sum of PVC requests bound to flui-shared in GB',
  })
  requestedGb?: number;

  @ApiPropertyOptional({
    description:
      'Monthly cost per additional GB in EUR (net), if the provider charges by volume size.',
  })
  pricePerGbMonthlyEur?: string;
}

export class ClusterCapacityPlanDto {
  @ApiProperty()
  clusterId: string;

  @ApiProperty()
  provider: string;

  @ApiPropertyOptional({ type: CapacityMasterDto })
  master?: CapacityMasterDto;

  @ApiProperty({ type: [CapacityCandidateDto] })
  candidates: CapacityCandidateDto[];

  @ApiPropertyOptional({ type: CapacityStorageDto })
  storage?: CapacityStorageDto;

  @ApiPropertyOptional({
    description:
      'Explanation if some data could not be resolved (e.g. provider does not expose pricing).',
  })
  message?: string;
}
