import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeploymentEntity } from './deployment.entity';

/**
 * Build log level
 */
export enum BuildLogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

/**
 * Build log entry for deployment builds
 */
@Entity('build_logs')
export class BuildLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  deploymentId: string;

  @ManyToOne(() => DeploymentEntity, (deployment) => deployment.buildLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deploymentId' })
  deployment: DeploymentEntity;

  @Column({
    type: 'enum',
    enum: BuildLogLevel,
    default: BuildLogLevel.INFO,
  })
  level: BuildLogLevel;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stage: string;

  @Column({ type: 'integer', nullable: true })
  stepNumber: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
