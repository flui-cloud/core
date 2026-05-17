import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RepositoryEntity } from '../../../repositories/entities/repository.entity';
import { DeploymentStatus, FrameworkType, BuildMode } from '../enums';
import { BuildLogEntity } from './build-log.entity';

/**
 * Deployment entity representing an application deployment
 */
@Entity('deployments')
export class DeploymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'uuid' })
  repositoryId: string;

  @ManyToOne(() => RepositoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repositoryId' })
  repository: RepositoryEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DeploymentStatus,
    default: DeploymentStatus.PENDING,
  })
  status: DeploymentStatus;

  @Column({
    type: 'enum',
    enum: FrameworkType,
    nullable: true,
  })
  framework: FrameworkType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  frameworkVersion: string;

  @Column({
    type: 'enum',
    enum: BuildMode,
    nullable: true,
  })
  buildMode: BuildMode;

  @Column({ type: 'varchar', length: 255, nullable: true })
  branch: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  commitSha: string;

  @Column({ type: 'text', nullable: true })
  commitMessage: string;

  @Column({ type: 'float', nullable: true })
  detectionConfidence: number;

  @Column({ type: 'text', nullable: true })
  dockerfile: string;

  @Column({ type: 'jsonb', nullable: true })
  buildPlan: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageTag: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  @Column({ type: 'integer', nullable: true })
  port: number;

  @Column({ type: 'jsonb', nullable: true })
  env: Array<{ name: string; value: string }>;

  @Column({ type: 'jsonb', nullable: true })
  resources: {
    cpu: { request: string; limit: string };
    memory: { request: string; limit: string };
  };

  @Column({ type: 'jsonb', nullable: true })
  scaling: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization?: number;
    targetMemoryUtilization?: number;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  warnings: string[];

  @Column({ type: 'integer', default: 0 })
  buildAttempts: number;

  @Column({ type: 'integer', nullable: true })
  buildDurationMs: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastDeployedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  k8sNamespace: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  k8sDeploymentName: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => BuildLogEntity, (log) => log.deployment, { cascade: true })
  buildLogs: BuildLogEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
