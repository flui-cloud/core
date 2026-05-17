import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column()
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;
}
