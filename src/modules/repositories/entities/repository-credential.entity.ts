import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { GitProvider } from './repository.entity';
import { GitHubAuthMethod } from '../enums/github-auth-method.enum';

@Entity('repository_credentials')
export class RepositoryCredentialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'provider', type: 'enum', enum: GitProvider })
  @Index()
  provider: GitProvider;

  @Column({ name: 'access_token_encrypted', type: 'text' })
  accessTokenEncrypted: string;

  @Column({ name: 'refresh_token_encrypted', type: 'text', nullable: true })
  refreshTokenEncrypted: string;

  @Column({ name: 'scope', type: 'varchar', nullable: true })
  scope: string;

  @Column({ name: 'token_type', type: 'varchar', default: 'Bearer' })
  tokenType: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({
    name: 'credential_type',
    type: 'enum',
    enum: GitHubAuthMethod,
    default: GitHubAuthMethod.OAUTH_APP,
  })
  credentialType: GitHubAuthMethod;

  @Column({ name: 'github_user_id', type: 'varchar', nullable: true })
  githubUserId: string;

  @Column({ name: 'github_username', type: 'varchar', nullable: true })
  githubUsername: string;

  @Column({ name: 'last_rotated_at', type: 'timestamptz', nullable: true })
  lastRotatedAt: Date | null;

  @Column({ name: 'last_verified_at', type: 'timestamptz', nullable: true })
  lastVerifiedAt: Date | null;

  @Column({
    name: 'last_verification_status',
    type: 'varchar',
    nullable: true,
  })
  lastVerificationStatus: 'OK' | 'INVALID' | 'SCOPE_MISSING' | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
