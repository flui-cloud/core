import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DnsProvider } from '../../providers/enums/dns-provider.enum';
import { ClusterDnsZoneEntity } from './cluster-dns-zone.entity';

@Entity('dns_zones')
export class DnsZoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  providerZoneId: string;

  @Column({ type: 'varchar' })
  zoneName: string;

  @Column({ type: 'enum', enum: DnsProvider })
  dnsProvider: DnsProvider;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ClusterDnsZoneEntity, (assignment) => assignment.dnsZone)
  clusterAssignments: ClusterDnsZoneEntity[];
}
