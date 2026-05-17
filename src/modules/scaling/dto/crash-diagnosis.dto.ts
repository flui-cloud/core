import { ApiProperty } from '@nestjs/swagger';
import { CrashCategory } from '../enums/crash-category.enum';
import { DiagnosisSeverity } from '../enums/diagnosis-severity.enum';
import {
  CrashEvidence,
  SuggestedAction,
} from '../interfaces/crash-diagnosis.interface';

export class CrashDiagnosisDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  podName: string;

  @ApiProperty({ nullable: true })
  containerName: string | null;

  @ApiProperty({ enum: CrashCategory })
  category: CrashCategory;

  @ApiProperty({ enum: DiagnosisSeverity })
  severity: DiagnosisSeverity;

  @ApiProperty()
  title: string;

  @ApiProperty()
  explanation: string;

  @ApiProperty({ type: Object })
  evidence: CrashEvidence;

  @ApiProperty({ nullable: true })
  patternMatchedKey: string | null;

  @ApiProperty({ type: Object })
  suggestedAction: SuggestedAction;

  @ApiProperty({ nullable: true })
  resolvedAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
