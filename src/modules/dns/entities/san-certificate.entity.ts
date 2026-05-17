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
import { ClusterDnsZoneEntity } from './cluster-dns-zone.entity';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import { CertificateStatus } from '../../providers/interfaces/certificate-provider.interface';
import { ReconciliationStatus } from '../../infrastructure/shared/enums/reconciliation-status.enum';
import { CertChallenge } from '../enums/cert-challenge.enum';

@Entity('san_certificates')
@Index(['clusterId', 'name'], { unique: true })
export class SanCertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clusterId: string;

  @ManyToOne(() => ClusterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clusterId' })
  cluster: ClusterEntity;

  @Column({ type: 'uuid', nullable: true })
  clusterDnsZoneId: string | null;

  @ManyToOne(() => ClusterDnsZoneEntity, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'clusterDnsZoneId' })
  clusterDnsZone: ClusterDnsZoneEntity | null;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'simple-array' })
  dnsNames: string[];

  @Column({
    type: 'enum',
    enum: CertChallenge,
    default: CertChallenge.HTTP_01,
  })
  certChallenge: CertChallenge;

  @Column({
    type: 'enum',
    enum: CertificateProvider,
    default: CertificateProvider.LETS_ENCRYPT,
  })
  certificateProvider: CertificateProvider;

  @Column({ type: 'varchar', default: 'flui-system' })
  masterNamespace: string;

  @Column({ type: 'varchar' })
  masterCertName: string;

  @Column({ type: 'varchar' })
  masterSecretName: string;

  @Column({ type: 'varchar' })
  issuerName: string;

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
