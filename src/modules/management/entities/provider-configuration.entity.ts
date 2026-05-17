import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderStatus } from './provider-status.enum';

@Entity('provider_configurations')
export class ProviderConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', enum: CloudProvider })
  provider: CloudProvider;

  @Column({
    type: 'varchar',
    enum: ProviderStatus,
    default: ProviderStatus.NOT_CONFIGURED,
  })
  status: ProviderStatus;

  @Column({ type: 'json', default: '[]' })
  enabledRegions: string[];

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  lastHealthCheck: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}
