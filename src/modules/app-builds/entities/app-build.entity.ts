import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AppBuildStatus } from '../enums/app-build-status.enum';
import { BuildProvider } from '../enums/build-provider.enum';

@Entity('app_builds')
export class AppBuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  applicationId: string | null;

  @Column({
    type: 'enum',
    enum: BuildProvider,
    default: BuildProvider.IN_CLUSTER_AGENT,
  })
  provider: BuildProvider;

  @Column({ type: 'uuid', nullable: true })
  targetClusterId: string | null;

  @Column({ length: 500, nullable: true })
  gitUrl: string | null;

  @Column({ length: 255, nullable: true })
  suggestedName: string | null;

  @Column({ type: 'uuid', nullable: true })
  buildClusterId: string | null;

  @Column({ length: 255 })
  branch: string;

  @Index()
  @Column({ length: 255, nullable: true })
  commitSha?: string;

  @Column({ length: 500, nullable: true })
  imageRef?: string;

  @Column({ length: 255, nullable: true })
  k8sJobName: string | null;

  @Column({ length: 255, nullable: true })
  k8sPodName?: string;

  @Index()
  @Column({ length: 255, nullable: true })
  externalRunId?: string;

  @Column({ length: 1000, nullable: true })
  externalUrl?: string;

  @Column({ length: 1000, nullable: true })
  logsUrl?: string;

  @Column({
    type: 'enum',
    enum: AppBuildStatus,
    default: AppBuildStatus.PENDING,
  })
  status: AppBuildStatus;

  @Column({ type: 'json', nullable: true })
  railpackPlan?: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  detectedPort?: number;

  @Column({ length: 64, nullable: true })
  detectedFramework?: string;

  @Column({ length: 64, nullable: true })
  detectedFrontendFramework?: string;

  @Column({ type: 'text', nullable: true })
  detectedStartCommand?: string;

  @Column({ length: 64, nullable: true })
  deployStrategy?: string | null;

  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  deployabilityScore?: number | null;

  @Column({ type: 'json', nullable: true })
  deployabilityFactors?: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  suggestedBuildCommand?: string | null;

  @Column({ type: 'text', nullable: true })
  suggestedStartCommand?: string | null;

  @Column({ type: 'simple-array', nullable: true })
  recommendedStructure?: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  logs?: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  operationId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
