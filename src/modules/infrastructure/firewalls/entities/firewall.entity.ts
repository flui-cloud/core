import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClusterEntity } from '../../clusters/entities/cluster.entity';
import { FirewallRuleDto } from '../../../providers/dto/firewall.dto';

@Entity('infrastructure_firewalls')
export class FirewallEntity {
  @PrimaryColumn('varchar')
  id: string; // Provider's firewall ID (e.g., Hetzner firewall ID)

  @Column()
  name: string;

  @Column()
  provider: string; // CloudProvider enum value

  @Column({ nullable: true })
  clusterId: string;

  @Column('json')
  rules: FirewallRuleDto[];

  @Column('json', { default: '[]' })
  sourceCidrs: string[];

  @Column('json', { default: '[]' })
  appliedToServerIds: string[];

  @Column('json', { default: '{}' })
  labels: Record<string, string>;

  @Column('json', { default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => ClusterEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'clusterId' })
  cluster: ClusterEntity;
}
