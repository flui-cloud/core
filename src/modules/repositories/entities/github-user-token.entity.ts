import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Stores a GitHub App User-to-Server access token obtained via the
 * "Request user authorization (OAuth) during installation" flow.
 *
 * Unlike installation tokens (which represent the App on behalf of an account),
 * U2S tokens represent a real GitHub user and can read that user's private
 * container packages — which installation tokens cannot when the App is owned
 * by a different organisation.
 */
@Entity('github_user_tokens')
export class GithubUserTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'flui_user_id', type: 'uuid' })
  fluiUserId: string;

  @Column({ name: 'github_user_id', type: 'bigint' })
  githubUserId: string;

  @Column({ name: 'github_login', type: 'varchar' })
  githubLogin: string;

  @Column({ name: 'installation_id', type: 'bigint', nullable: true })
  installationId: string | null;

  @Column({ name: 'access_token_encrypted', type: 'text' })
  accessTokenEncrypted: string;

  /**
   * Only populated when the App is configured to "Expire user authorization
   * tokens". When expire is disabled, this column stays NULL and the token
   * does not need refreshing.
   */
  @Column({ name: 'refresh_token_encrypted', type: 'text', nullable: true })
  refreshTokenEncrypted: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({
    name: 'refresh_token_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  refreshTokenExpiresAt: Date | null;

  @Column({ name: 'scopes', type: 'text', nullable: true })
  scopes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
