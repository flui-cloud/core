import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VNetSubnetEntity } from './vnet-subnet.entity';
import { VNetRouteEntity } from './vnet-route.entity';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';

export enum VNetStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  DELETING = 'DELETING',
  DELETED = 'DELETED',
}

export interface VNetLabel {
  key: string;
  value: string;
}

@Entity('vnets')
export class VNetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  providerResourceId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: CloudProvider })
  provider: CloudProvider;

  @Column({ type: 'varchar', length: 50 })
  ipRange: string;

  @Column({ type: 'jsonb', default: '[]' })
  labels: VNetLabel[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: VNetStatus,
    default: VNetStatus.PENDING,
  })
  status: VNetStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => VNetSubnetEntity, (subnet) => subnet.vnet, {
    cascade: true,
    eager: true,
  })
  subnets: VNetSubnetEntity[];

  @OneToMany(() => VNetRouteEntity, (route) => route.vnet, {
    cascade: true,
    eager: true,
  })
  routes: VNetRouteEntity[];
}
