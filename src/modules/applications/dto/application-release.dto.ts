import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReleaseStatus } from '../enums/release-status.enum';

export class ApplicationReleaseDto {
  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  operationId: string;

  @ApiProperty({ enum: ReleaseStatus })
  status: ReleaseStatus;

  @ApiPropertyOptional({ description: 'Image being deployed by this release.' })
  imageRef?: string | null;

  @ApiPropertyOptional({
    description:
      'Canonical digest (sha256:...) of the image being deployed, when known. Preferred identifier for client-side matching.',
  })
  digest?: string | null;

  @ApiPropertyOptional({
    description:
      'Image that was active before this release was triggered. Useful to show "rolled back to X" in the UI.',
  })
  previousImageRef?: string | null;

  @ApiPropertyOptional({
    description:
      'Build row that produced the image (when the release came from a Flui build, not an external trigger).',
  })
  buildId?: string | null;

  @ApiPropertyOptional({
    description:
      'Human-readable reason for FAILED. Typically the Kubernetes condition message, e.g. "ReplicaSet ... has timed out progressing.".',
  })
  failureReason?: string | null;

  @ApiProperty()
  startedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  completedAt?: Date | null;
}

export class ApplicationReleaseListDto {
  @ApiProperty({ type: [ApplicationReleaseDto] })
  releases: ApplicationReleaseDto[];
}
