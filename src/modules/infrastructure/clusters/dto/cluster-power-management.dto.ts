import { ApiProperty } from '@nestjs/swagger';
import { ClusterStatus } from '../entities/cluster.entity';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * Response DTO for cluster stop/start operation (async)
 */
export class ClusterPowerOperationResponseDto {
  @ApiProperty({
    description: 'Operation ID for tracking',
    example: 'op-123e4567-e89b-12d3-a456-426614174000',
  })
  operation_id: string;

  @ApiProperty({
    description: 'Cluster ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Operation status',
    example: 'pending',
    enum: ['pending'],
  })
  status: string;

  @ApiProperty({
    description: 'Estimated duration for completion',
    example: '2-5 minutes',
  })
  estimated_duration: string;

  @ApiProperty({
    description: 'Operation creation timestamp',
  })
  created_at: Date;
}

/**
 * @deprecated Use ClusterPowerOperationResponseDto for async operations
 * Response DTO for cluster stop operation (legacy sync)
 */
export class ClusterStopResponseDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Cluster name',
    example: 'my-workload-cluster',
  })
  cluster_name: string;

  @ApiProperty({
    description: 'Cluster status after operation',
    enum: ClusterStatus,
    example: ClusterStatus.STOPPED,
  })
  status: ClusterStatus;

  @ApiProperty({
    description: 'Number of servers that were stopped',
    example: 3,
  })
  servers_stopped: number;

  @ApiProperty({
    description: 'Total number of servers in cluster',
    example: 3,
  })
  total_servers: number;

  @ApiProperty({
    description: 'Estimated monthly cost savings',
    example: '~20.70€',
  })
  monthly_savings_estimate: string;
}

/**
 * Response DTO for cluster start operation
 */
export class ClusterStartResponseDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Cluster name',
    example: 'my-workload-cluster',
  })
  cluster_name: string;

  @ApiProperty({
    description: 'Cluster status after operation',
    enum: ClusterStatus,
    example: ClusterStatus.READY,
  })
  status: ClusterStatus;

  @ApiProperty({
    description: 'Number of servers that were started',
    example: 3,
  })
  servers_started: number;

  @ApiProperty({
    description: 'Total number of servers in cluster',
    example: 3,
  })
  total_servers: number;
}

/**
 * Request DTO for reconcile status operation
 */
export class ReconcileStatusDto {
  @ApiProperty({
    description:
      'Auto-fix inconsistencies by starting/stopping servers to match desired state',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoFix?: boolean;
}

/**
 * Response DTO for reconcile status operation
 */
export class ReconcileStatusResponseDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cluster_id: string;

  @ApiProperty({
    description: 'Cluster name',
    example: 'my-workload-cluster',
  })
  cluster_name: string;

  @ApiProperty({
    description: 'Cluster status before reconciliation',
    enum: ClusterStatus,
    example: ClusterStatus.READY,
  })
  previous_status: ClusterStatus;

  @ApiProperty({
    description: 'Cluster status after reconciliation',
    enum: ClusterStatus,
    example: ClusterStatus.STOPPED,
  })
  new_status: ClusterStatus;

  @ApiProperty({
    description:
      'Whether cluster status is now synced with real provider state',
    example: true,
  })
  is_synced: boolean;

  @ApiProperty({
    description: 'Number of nodes that were reconciled',
    example: 3,
  })
  nodes_reconciled: number;

  @ApiProperty({
    description: 'List of actions taken during reconciliation',
    example: ['Updated cluster status from READY to STOPPED'],
    type: [String],
  })
  actions_taken: string[];
}
