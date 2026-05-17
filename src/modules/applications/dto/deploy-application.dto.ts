import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeployApplicationDto {
  @ApiPropertyOptional({
    example: 'nginx:1.26',
    description: 'New image reference (for docker_image source type)',
  })
  @IsOptional()
  @IsString()
  imageRef?: string;

  @ApiPropertyOptional({
    example: 'abc123def',
    description: 'Commit SHA to deploy (for git_build source type)',
  })
  @IsOptional()
  @IsString()
  commitSha?: string;

  @ApiPropertyOptional({
    description:
      'Deploy directly from an existing completed build, skipping the build step',
    example: 'uuid-of-build',
  })
  @IsOptional()
  @IsUUID()
  buildId?: string;

  @ApiPropertyOptional({
    description:
      'Re-deploy the current image already on the application without triggering a new build',
    example: true,
  })
  @IsOptional()
  useCurrentImage?: boolean;

  @ApiPropertyOptional({
    description: 'Reason or description for this deploy',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
