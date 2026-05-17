import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GitHubAuthMethod } from '../enums/github-auth-method.enum';

@Entity('github_integration_config')
export class GitHubIntegrationConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auth_method', type: 'enum', enum: GitHubAuthMethod })
  authMethod: GitHubAuthMethod;

  @Column({ name: 'client_id_encrypted', type: 'text', nullable: true })
  clientIdEncrypted: string;

  @Column({ name: 'client_secret_encrypted', type: 'text', nullable: true })
  clientSecretEncrypted: string;

  @Column({ name: 'callback_url', type: 'varchar', nullable: true })
  callbackUrl: string;

  @Column({ name: 'app_id', type: 'varchar', nullable: true })
  appId: string;

  @Column({ name: 'private_key_encrypted', type: 'text', nullable: true })
  privateKeyEncrypted: string;

  @Column({
    name: 'app_webhook_secret_encrypted',
    type: 'text',
    nullable: true,
  })
  appWebhookSecretEncrypted: string;

  @Column({ name: 'app_slug', type: 'varchar', nullable: true })
  appSlug: string;

  @Column({ name: 'is_configured', type: 'boolean', default: false })
  isConfigured: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
