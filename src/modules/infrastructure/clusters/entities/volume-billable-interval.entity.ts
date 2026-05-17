import { Entity, PrimaryColumn, Column, Index, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum VolumeBillableKind {
  SHARED_STORAGE = 'shared-storage',
  APP_VOLUME = 'app-volume',
  SNAPSHOT = 'snapshot',
}

@Entity('infrastructure_volume_billable_intervals')
@Index(['clusterId', 'startedAt'])
@Index(['volumeProviderId', 'endedAt'])
export class VolumeBillableIntervalEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column('uuid')
  clusterId: string;

  @Column()
  volumeProviderId: string;

  @Column()
  provider: string;

  @Column()
  region: string;

  @Column({ type: 'enum', enum: VolumeBillableKind })
  kind: VolumeBillableKind;

  @Column()
  sizeGb: number;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt?: Date | null;

  @Column({ type: 'json', default: '{}' })
  metadata: Record<string, any>;
}
