import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { CredentialPurpose } from '../enums/credential-purpose.enum';

@Entity('provider_credentials')
export class ProviderCredentialsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @Column()
  client_secret: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    transformer: {
      to: (value: CloudProvider) => value,
      from: (value: string) => value as CloudProvider,
    },
  })
  provider: CloudProvider;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  token_expires_at: Date;

  @Column({ nullable: true })
  refresh_token_expires_at: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 32,
    default: CredentialPurpose.COMPUTE,
  })
  purpose: CredentialPurpose;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
