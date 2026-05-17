import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum GitProvider {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
}

@Entity('repositories')
export class RepositoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'provider', type: 'enum', enum: GitProvider })
  provider: GitProvider;

  @Column({ name: 'repository_url', type: 'varchar' })
  repositoryUrl: string;

  @Column({ name: 'repository_name', type: 'varchar' })
  repositoryName: string;

  @Column({ name: 'repository_full_name', type: 'varchar' })
  @Index()
  repositoryFullName: string;

  @Column({ name: 'owner', type: 'varchar' })
  owner: string;

  @Column({ name: 'default_branch', type: 'varchar', default: 'main' })
  defaultBranch: string;

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ name: 'clone_url', type: 'varchar' })
  cloneUrl: string;

  @Column({ name: 'ssh_url', type: 'varchar', nullable: true })
  sshUrl: string;

  @Column({ name: 'html_url', type: 'varchar' })
  htmlUrl: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'language', type: 'varchar', nullable: true })
  language: string;

  @Column({ name: 'access_token_encrypted', type: 'text' })
  accessTokenEncrypted: string;

  @Column({ name: 'webhook_secret', type: 'varchar', nullable: true })
  webhookSecret: string;

  @Column({ name: 'webhook_url', type: 'varchar', nullable: true })
  webhookUrl: string;

  @Column({ name: 'webhook_id', type: 'varchar', nullable: true })
  webhookId: string;

  @Column({ name: 'webhook_active', type: 'boolean', default: false })
  webhookActive: boolean;

  @Column({ name: 'auto_deploy_enabled', type: 'boolean', default: false })
  autoDeployEnabled: boolean;

  @Column({ name: 'detected_framework', type: 'varchar', nullable: true })
  detectedFramework: string | null;

  @Column({
    name: 'detected_frontend_framework',
    type: 'varchar',
    nullable: true,
  })
  detectedFrontendFramework: string | null;

  @Column({ name: 'detected_port', type: 'int', nullable: true })
  detectedPort: number | null;

  @Column({ name: 'last_sync_at', type: 'timestamptz', nullable: true })
  lastSyncAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
