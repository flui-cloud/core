import { ApiProperty } from '@nestjs/swagger';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import {
  ClusterStatus,
  ClusterType,
} from '../../infrastructure/clusters/entities/cluster.entity';
import {
  NodeStatus,
  NodeType,
} from '../../infrastructure/clusters/entities/cluster-node.entity';
import { ApplicationStatus } from '../../applications/enums/application-status.enum';

export class DistributionNodeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: NodeType })
  nodeType: NodeType;

  @ApiProperty({ enum: NodeStatus })
  status: NodeStatus;

  @ApiProperty({ required: false })
  ipAddress?: string;
}

export class DistributionAppDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty({ example: 3, description: 'Desired replica count' })
  replicas: number;

  @ApiProperty()
  k8sNamespace: string;

  @ApiProperty({ required: false })
  imageRef?: string;
}

export class DistributionClusterDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CloudProvider })
  provider: CloudProvider;

  @ApiProperty()
  region: string;

  @ApiProperty({ enum: ClusterStatus })
  status: ClusterStatus;

  @ApiProperty({ enum: ClusterType })
  clusterType: ClusterType;

  @ApiProperty({ type: [DistributionNodeDto] })
  nodes: DistributionNodeDto[];

  @ApiProperty({ type: [DistributionAppDto] })
  apps: DistributionAppDto[];

  @ApiProperty({ example: 5 })
  totalApps: number;

  @ApiProperty({ example: 12, description: 'Sum of replicas across all apps' })
  totalReplicas: number;
}

export class DistributionTotalsDto {
  @ApiProperty()
  clusters: number;

  @ApiProperty()
  nodes: number;

  @ApiProperty()
  apps: number;

  @ApiProperty()
  replicas: number;
}

export class ClusterAppDistributionDto {
  @ApiProperty({ type: [DistributionClusterDto] })
  clusters: DistributionClusterDto[];

  @ApiProperty({ type: DistributionTotalsDto })
  totals: DistributionTotalsDto;
}
