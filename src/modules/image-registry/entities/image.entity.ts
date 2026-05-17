import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationEntity } from '../../applications/entities/application.entity';

@Entity('images')
export class ImageEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column('uuid')
  appId: string;

  @ManyToOne(() => ApplicationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appId' })
  application: ApplicationEntity;

  @Column({ length: 500 })
  imageRef: string;

  @Column({ length: 40 })
  commitSha: string;

  @Column({ length: 255 })
  branch: string;

  @Column({ type: 'text', nullable: true })
  githubPackageId?: string;

  @Column({ type: 'bigint', nullable: true })
  sizeBytes?: number;

  @Column({ type: 'json', default: '[]' })
  fluiTags: string[];

  @Column({ default: false })
  isCurrentlyDeployed: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
