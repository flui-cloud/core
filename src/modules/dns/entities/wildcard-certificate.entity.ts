import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { DnsZoneEntity } from './dns-zone.entity';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import { CertificateStatus } from '../../providers/interfaces/certificate-provider.interface';
import { ReconciliationStatus } from '../../infrastructure/shared/enums/reconciliation-status.enum';

@Entity('wildcard_certificates')
@Index(['clusterId', 'scope'], { unique: true })
export class WildcardCertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clusterId: string;

  @ManyToOne(() => ClusterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clusterId' })
  cluster: ClusterEntity;

  @Column({ type: 'uuid' })
  dnsZoneId: string;

  @ManyToOne(() => DnsZoneEntity, { eager: true })
  @JoinColumn({ name: 'dnsZoneId' })
  dnsZone: DnsZoneEntity;

  @Column({ type: 'varchar' })
  scope: string;

  @Column({ type: 'varchar' })
  masterNamespace: string;

  @Column({ type: 'varchar' })
  masterSecretName: string;

  @Column({ type: 'varchar' })
  masterCertName: string;

  @Column({ type: 'varchar' })
  issuerName: string;

  @Column({ type: 'enum', enum: CertificateProvider })
  certificateProvider: CertificateProvider;

  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status: CertificateStatus;

  @Column({
    type: 'enum',
    enum: ReconciliationStatus,
    default: ReconciliationStatus.PENDING,
  })
  reconciliationStatus: ReconciliationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  notAfter: Date;

  @Column({ type: 'timestamptz', nullable: true })
  renewalTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastReconciliationAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
