import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FrameworkType } from '../enums';

/**
 * Framework template entity for versioned templates
 * Future: Templates will be loaded from Git repository
 */
@Entity('framework_templates')
@Index(['frameworkType', 'majorVersion'], { unique: true })
export class FrameworkTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FrameworkType,
  })
  frameworkType: FrameworkType;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'varchar', length: 20 })
  majorVersion: string;

  @Column({ type: 'varchar', length: 50 })
  templateVersion: string;

  @Column({ type: 'text' })
  dockerfileTemplate: string;

  @Column({ type: 'jsonb' })
  defaults: {
    buildCommand?: string;
    outputDir?: string;
    port?: number;
    nodeVersion?: string;
    resources?: {
      cpu: { request: string; limit: string };
      memory: { request: string; limit: string };
    };
    healthCheck?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  compatibility: {
    nodejs?: { min: string; recommended: string; max?: string };
    dependencies?: Record<string, string>;
  };

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentationUrl: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: false })
  recommended: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  eolDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
