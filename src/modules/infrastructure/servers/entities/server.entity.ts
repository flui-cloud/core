import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('infrastructure_servers')
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  provider: string; // hetzner, contabo, scaleway

  @Column({ nullable: true })
  providerResourceId?: string; // ID dal provider (es: Hetzner server ID)

  @Column()
  size: string; // server type: cx22, cx32, etc.

  @Column()
  region: string; // region: fsn1, nbg1, etc.

  @Column()
  status: string; // running, stopped, starting, etc.

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  privateIp?: string;

  @Column({ type: 'uuid', nullable: true })
  subnetId?: string;

  @Column()
  pulumiProject: string; // Pulumi project ID for this server

  @Column()
  pulumiStack: string; // Pulumi stack name

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
