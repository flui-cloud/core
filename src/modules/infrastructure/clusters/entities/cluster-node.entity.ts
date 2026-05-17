import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ClusterEntity } from './cluster.entity';

export enum NodeType {
  MASTER = 'master',
  WORKER = 'worker',
}

export enum NodeStatus {
  CREATING = 'creating',
  JOINING = 'joining',
  READY = 'ready',
  ERROR = 'error',
  DELETING = 'deleting',
}

@Entity('infrastructure_cluster_nodes')
export class ClusterNodeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column()
  clusterId: string;

  @Column()
  serverName: string;

  @Column()
  providerResourceId: string; // Server ID from cloud provider

  @Column({ type: 'enum', enum: NodeType })
  nodeType: NodeType;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  privateIp?: string;

  @Column({ type: 'uuid', nullable: true })
  subnetId?: string;

  @Column({
    type: 'enum',
    enum: NodeStatus,
    default: NodeStatus.CREATING,
  })
  status: NodeStatus;

  @Column({ type: 'json', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ClusterEntity, (cluster) => cluster.nodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clusterId' })
  cluster: ClusterEntity;
}
