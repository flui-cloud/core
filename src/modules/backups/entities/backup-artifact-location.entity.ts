import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { BackupArtifactEntity } from './backup-artifact.entity';
import { BackupDestinationEntity } from './backup-destination.entity';
import { DestinationRole } from '../enums/destination-role.enum';
import { ArtifactLocationState } from '../enums/artifact-location-state.enum';

@Entity('backup_artifact_locations')
@Unique('uq_artifact_locations_artifact_dest', ['artifactId', 'destinationId'])
@Index('idx_artifact_locations_dest_state', ['destinationId', 'state'])
export class BackupArtifactLocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  artifactId: string;

  @ManyToOne(() => BackupArtifactEntity, (a) => a.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artifactId' })
  artifact: BackupArtifactEntity;

  @Column({ type: 'uuid' })
  destinationId: string;

  @ManyToOne(() => BackupDestinationEntity)
  @JoinColumn({ name: 'destinationId' })
  destination: BackupDestinationEntity;

  @Column({ type: 'enum', enum: DestinationRole })
  role: DestinationRole;

  @Column({
    type: 'enum',
    enum: ArtifactLocationState,
    default: ArtifactLocationState.PENDING,
  })
  state: ArtifactLocationState;

  @Column({ length: 512 })
  objectKeyPrefix: string;

  @Column({ type: 'bigint', nullable: true })
  bytesStored?: string;

  @Column({ length: 128, nullable: true })
  checksum?: string;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
