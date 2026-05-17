import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationEntity } from '../../applications/entities/application.entity';
import { CrashCategory } from '../enums/crash-category.enum';
import { DiagnosisSeverity } from '../enums/diagnosis-severity.enum';
import {
  CrashEvidence,
  SuggestedAction,
} from '../interfaces/crash-diagnosis.interface';

@Entity('crash_diagnoses')
@Index(['applicationId', 'createdAt'])
export class CrashDiagnosisEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column('uuid')
  applicationId: string;

  @ManyToOne(() => ApplicationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: ApplicationEntity;

  @Column({ length: 255 })
  podName: string;

  @Column({ length: 255, nullable: true })
  containerName: string | null;

  @Column({ type: 'enum', enum: CrashCategory })
  category: CrashCategory;

  @Column({ type: 'enum', enum: DiagnosisSeverity })
  severity: DiagnosisSeverity;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ type: 'json', default: '{}' })
  evidence: CrashEvidence;

  @Column({ length: 100, nullable: true })
  patternMatchedKey: string | null;

  @Column({ type: 'json' })
  suggestedAction: SuggestedAction;

  @Column({ type: 'json', nullable: true })
  podSnapshot: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
