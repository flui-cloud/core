import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class BuildJobInfoDto {
  @ApiProperty() name: string;
  @ApiProperty({
    enum: ['Running', 'Pending', 'Succeeded', 'Failed', 'Unknown'],
  })
  status: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown';
  @ApiProperty({ description: 'Age in minutes' }) ageMinutes: number;
  @ApiProperty({ nullable: true }) buildId: string | null;
  @ApiProperty({ nullable: true }) appSlug: string | null;
  @ApiProperty({
    nullable: true,
    description: 'e.g. bootstrap-runner for bootstrap jobs',
  })
  purpose: string | null;
  @ApiProperty() cpuRequest: string;
  @ApiProperty() memoryRequest: string;
}

export class BuildPodContainerDto {
  @ApiProperty() name: string;
  @ApiProperty() ready: boolean;
  @ApiProperty() state: string;
}

export class BuildPodInfoDto {
  @ApiProperty() name: string;
  @ApiProperty() phase: string;
  @ApiProperty({ description: 'Age in minutes' }) ageMinutes: number;
  @ApiProperty({ nullable: true }) buildId: string | null;
  @ApiProperty({ nullable: true }) appSlug: string | null;
  @ApiProperty({ type: [BuildPodContainerDto] })
  containers: BuildPodContainerDto[];
}

export class QueuedBuildInfoDto {
  @ApiProperty() buildId: string;
  @ApiProperty() applicationId: string;
  @ApiProperty({ nullable: true }) appSlug: string | null;
  @ApiProperty() branch: string;
  @ApiProperty({ nullable: true }) commitSha: string | null;
  @ApiProperty({ description: 'Age in minutes since the build was enqueued' })
  ageMinutes: number;
  @ApiProperty({
    enum: ['PENDING', 'CLONING', 'ANALYZING', 'BUILDING', 'PUSHING'],
  })
  status: string;
}

export class BuildNamespaceResourcesResponseDto {
  @ApiProperty() namespace: string;
  @ApiProperty({
    type: [BuildJobInfoDto],
    description: 'K8s Jobs currently running in flui-build',
  })
  jobs: BuildJobInfoDto[];
  @ApiProperty({
    type: [BuildPodInfoDto],
    description: 'K8s Pods currently in flui-build',
  })
  pods: BuildPodInfoDto[];
  @ApiProperty({
    type: [QueuedBuildInfoDto],
    description:
      'Builds waiting in Bull queue (PENDING status, no K8s Job yet)',
  })
  queuedBuilds: QueuedBuildInfoDto[];
  @ApiProperty({
    description: 'Sum of CPU requests across all running jobs (millicores)',
  })
  totalCpuRequestMillicores: number;
  @ApiProperty({
    description: 'Sum of memory requests across all running jobs (MiB)',
  })
  totalMemoryRequestMiB: number;
}

export class CleanupBuildNamespaceDto {
  @ApiPropertyOptional({
    default: 0,
    description:
      'Only remove resources older than this many minutes. 0 = no age filter.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  olderThanMinutes?: number;

  @ApiPropertyOptional({
    default: false,
    description:
      'If true, return what would be deleted without actually deleting.',
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class BuildNamespaceCleanupResultDto {
  @ApiProperty({ type: [String] }) deletedJobs: string[];
  @ApiProperty({ type: [String] }) deletedPods: string[];
  @ApiProperty() dryRun: boolean;
}

export class BuildCacheInfoResponseDto {
  @ApiProperty({ example: 'flui-buildkit-cache' }) pvcName: string;
  @ApiProperty({ example: 'flui-build' }) namespace: string;
  @ApiProperty() exists: boolean;
  @ApiProperty({ enum: ['Bound', 'Pending', 'Lost'], nullable: true }) phase:
    | string
    | null;
  @ApiProperty({
    example: '20Gi',
    nullable: true,
    description: 'Allocated PVC capacity',
  })
  capacity: string | null;
  @ApiProperty({ example: 'local-path', nullable: true }) storageClass:
    | string
    | null;
  @ApiProperty({ nullable: true }) createdAt: Date | null;
}

export class ClearBuildCacheResponseDto {
  @ApiProperty({
    description:
      'Subscribe via WebSocket /infrastructure room operation:{operationId} for progress',
  })
  operationId: string;
  @ApiProperty({ enum: ['started'] }) status: 'started';
}
