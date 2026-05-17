import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VNetEntity } from './vnet.entity';

@Entity('vnet_routes')
export class VNetRouteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vnetId: string;

  @Column({ type: 'varchar', length: 50 })
  destination: string;

  @Column({ type: 'varchar', length: 50 })
  gateway: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => VNetEntity, (vnet) => vnet.routes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vnetId' })
  vnet: VNetEntity;
}
