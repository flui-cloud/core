import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClusterEntity } from '../../clusters/entities/cluster.entity';
import { FirewallRuleDto } from '../../../providers/dto/firewall.dto';
import { ReconciliationStatus } from '../../shared/enums/reconciliation-status.enum';

export { ReconciliationStatus } from '../../shared/enums/reconciliation-status.enum';

@Entity('cluster_firewalls')
export class ClusterFirewallEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  clusterId: string;

  @ManyToOne(() => ClusterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clusterId' })
  cluster: ClusterEntity;

  @Column({ type: 'varchar', nullable: true })
  providerFirewallId: string;

  @Column({ type: 'jsonb', default: [] })
  desiredRules: FirewallRuleDto[];

  @Column({ type: 'jsonb', nullable: true })
  lastAppliedRules: FirewallRuleDto[];

  @Column({ type: 'varchar', length: 64, nullable: true })
  desiredHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  lastAppliedHash: string;

  @Column({
    type: 'enum',
    enum: ReconciliationStatus,
    default: ReconciliationStatus.PENDING,
  })
  reconciliationStatus: ReconciliationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastReconciliationAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
