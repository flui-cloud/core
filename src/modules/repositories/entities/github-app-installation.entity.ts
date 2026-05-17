import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('github_app_installations')
export class GitHubAppInstallationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'installation_id', type: 'bigint', unique: true })
  installationId: number;

  @Column({ name: 'account_login', type: 'varchar' })
  @Index()
  accountLogin: string;

  @Column({ name: 'account_type', type: 'varchar' })
  accountType: 'User' | 'Organization';

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'repository_selection', type: 'varchar', default: 'all' })
  repositorySelection: string;

  @Column({ name: 'suspended_at', type: 'timestamptz', nullable: true })
  suspendedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
