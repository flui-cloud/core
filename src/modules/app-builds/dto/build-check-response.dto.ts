import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BuildResourceStatus } from '../../infrastructure/clusters/dto/build-resources.dto';
import { BuildAdvisorResultDto } from './build-advisor-result.dto';

export class ExistingBuildInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  imageRef: string;

  @ApiPropertyOptional()
  detectedFramework?: string;

  @ApiPropertyOptional()
  detectedFrontendFramework?: string;

  @ApiPropertyOptional()
  detectedPort?: number;

  @ApiProperty()
  completedAt: Date;
}

export class RepositoryFrameworkInfoDto {
  @ApiPropertyOptional()
  detectedFramework?: string;

  @ApiPropertyOptional()
  detectedFrontendFramework?: string;

  @ApiPropertyOptional()
  detectedPort?: number;
}

export class BuildResourceCheckDto {
  @ApiProperty({
    enum: ['ok', 'autoscaling_required', 'insufficient', 'unknown'],
  })
  status: BuildResourceStatus | 'unknown';

  @ApiPropertyOptional()
  availableCpu?: string;

  @ApiPropertyOptional()
  availableMemory?: string;
}

export class BuildCheckResponseDto {
  @ApiProperty({
    description:
      'True if the current commit was already built — deploy can skip the build step',
  })
  canSkipBuild: boolean;

  @ApiProperty()
  branch: string;

  @ApiPropertyOptional({
    description:
      'HEAD commit SHA of the configured branch. Null if GitHub API was unreachable.',
  })
  currentCommitSha?: string;

  @ApiPropertyOptional({
    type: ExistingBuildInfoDto,
    description: 'Present only when canSkipBuild is true',
  })
  existingBuild?: ExistingBuildInfoDto;

  @ApiPropertyOptional({
    type: RepositoryFrameworkInfoDto,
    description: 'Framework detected during the last build on this repository',
  })
  repositoryFramework?: RepositoryFrameworkInfoDto;

  @ApiPropertyOptional({
    type: BuildResourceCheckDto,
    description: 'Current resource availability on the build cluster',
  })
  resourceCheck?: BuildResourceCheckDto;

  @ApiPropertyOptional({
    type: BuildAdvisorResultDto,
    description:
      'Build advisor result: strategy, score, and choices for user confirmation',
  })
  advisor?: BuildAdvisorResultDto;
}
