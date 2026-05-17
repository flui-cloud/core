import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthzInstallStatus } from '../enums/authz-install-status.enum';

@Entity('cluster_authz_installs')
export class ClusterAuthzInstallEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clusterId: string;

  @Column()
  clusterName: string;

  @Column({ type: 'enum', enum: AuthzInstallStatus })
  status: AuthzInstallStatus;

  @Column({ nullable: true })
  operationId?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  installedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
