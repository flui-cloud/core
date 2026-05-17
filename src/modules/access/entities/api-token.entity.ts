import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { CredentialType } from '../../management/entities/credentials.entity';
import { CredentialPurpose } from '../enums/credential-purpose.enum';

@Entity('api_tokens')
export class ApiTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    transformer: {
      to: (value: CloudProvider) => value,
      from: (value: string) => value as CloudProvider,
    },
  })
  provider: CloudProvider;

  @Column({
    type: 'varchar',
    default: CredentialType.API_KEY,
  })
  credential_type: CredentialType;

  @Column()
  label: string;

  @Column({ nullable: true })
  notes: string;

  /**
   * For api_key: the API token (encrypted).
   * For access_key_secret: the secret key (encrypted).
   */
  @Column()
  encrypted_token: string;

  /**
   * For access_key_secret only: the access key ID (encrypted).
   * Null for api_key credentials.
   */
  @Column({ nullable: true })
  encrypted_access_key: string;

  /**
   * Optional expiry date provided by the user at registration time.
   * Cannot be inferred from the key itself.
   */
  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ nullable: true })
  last_used_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'varchar',
    length: 32,
    default: CredentialPurpose.COMPUTE,
  })
  purpose: CredentialPurpose;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
