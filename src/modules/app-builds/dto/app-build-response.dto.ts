import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppBuildStatus } from '../enums/app-build-status.enum';
import { BuildProvider } from '../enums/build-provider.enum';

export class AppBuildResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  applicationId: string | null;

  @ApiProperty({
    enum: BuildProvider,
    description:
      'Origin of the build. IN_CLUSTER_AGENT for builds run in the flui-build namespace, GITHUB_ACTIONS for builds executed via the generated workflow.',
  })
  provider: BuildProvider;

  @ApiPropertyOptional({ nullable: true })
  targetClusterId: string | null;

  @ApiPropertyOptional({ nullable: true })
  gitUrl: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Suggested app name extracted from package.json/pyproject.toml/Cargo.toml or repo slug. Populated after ANALYZING phase for standalone builds.',
  })
  suggestedName: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Cluster on which the build was executed. Null for external builds (e.g. GitHub Actions).',
  })
  buildClusterId: string | null;

  @ApiProperty({ example: 'main' })
  branch: string;

  @ApiPropertyOptional()
  commitSha?: string;

  @ApiPropertyOptional({ example: 'ghcr.io/myorg/myapp:abc123-1700000000' })
  imageRef?: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Kubernetes Job name. Populated only for IN_CLUSTER_AGENT builds.',
  })
  k8sJobName: string | null;

  @ApiPropertyOptional()
  k8sPodName?: string;

  @ApiPropertyOptional({
    description:
      'Provider-specific run identifier (e.g. GitHub Actions workflow run id).',
  })
  externalRunId?: string;

  @ApiPropertyOptional({
    description: 'Link to the external build run UI (e.g. GitHub Actions).',
  })
  externalUrl?: string;

  @ApiPropertyOptional({
    description:
      'Direct link to the build logs (when distinct from externalUrl).',
  })
  logsUrl?: string;

  @ApiProperty({ enum: AppBuildStatus })
  status: AppBuildStatus;

  @ApiPropertyOptional()
  railpackPlan?: Record<string, any>;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Container port detected from Railpack plan',
  })
  detectedPort?: number;

  @ApiPropertyOptional({
    example: 'Node.js',
    description: 'Runtime framework detected from Railpack plan',
  })
  detectedFramework?: string;

  @ApiPropertyOptional({
    example: 'Angular',
    description:
      'Frontend framework detected from Railpack plan (Angular, React, Vue, etc.)',
  })
  detectedFrontendFramework?: string;

  @ApiPropertyOptional({
    description:
      'Auto-corrected start command derived from Railpack plan. Immutable per-build audit trail.',
  })
  detectedStartCommand?: string;

  @ApiPropertyOptional({
    description: 'Build strategy decided by the pre-flight advisor',
    example: 'railpack_with_overrides',
  })
  deployStrategy?: string | null;

  @ApiPropertyOptional({
    description: 'Composite deployability score (0.0–1.0)',
    example: 0.88,
  })
  deployabilityScore?: number | null;

  @ApiPropertyOptional({ description: 'Per-factor deployability breakdown' })
  deployabilityFactors?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description:
      'Build command suggested by the advisor (e.g. ./mvnw -DskipTests -B package)',
  })
  suggestedBuildCommand?: string | null;

  @ApiPropertyOptional({
    description:
      'Start command suggested by the advisor (e.g. node dist/main.js)',
  })
  suggestedStartCommand?: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Structural changes recommended to improve deployability',
  })
  recommendedStructure?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  logs?: string[];

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  operationId?: string;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TriggerBuildResponseDto {
  @ApiProperty()
  operationId: string;

  @ApiPropertyOptional()
  buildId?: string;
}
