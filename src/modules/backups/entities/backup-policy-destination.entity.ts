import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { BackupPolicyEntity } from './backup-policy.entity';
import { BackupDestinationEntity } from './backup-destination.entity';
import {
  DestinationRole,
  ReplicationStatus,
} from '../enums/destination-role.enum';

@Entity('backup_policy_destinations')
@Unique('uq_backup_policy_destinations_policy_dest', [
  'policyId',
  'destinationId',
])
@Index('idx_bpd_policy', ['policyId'])
@Index('idx_bpd_destination', ['destinationId'])
export class BackupPolicyDestinationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  policyId: string;

  @ManyToOne(() => BackupPolicyEntity, (p) => p.destinations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policyId' })
  policy: BackupPolicyEntity;

  @Column({ type: 'uuid' })
  destinationId: string;

  @ManyToOne(() => BackupDestinationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'destinationId' })
  destination: BackupDestinationEntity;

  @Column({ type: 'enum', enum: DestinationRole })
  role: DestinationRole;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'int', nullable: true })
  retentionDaysOverride?: number;

  @Column({ type: 'int', nullable: true })
  retentionMaxCopiesOverride?: number;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastReplicationAt?: Date;

  @Column({
    type: 'enum',
    enum: ReplicationStatus,
    default: ReplicationStatus.NEVER_RUN,
  })
  lastReplicationStatus: ReplicationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
