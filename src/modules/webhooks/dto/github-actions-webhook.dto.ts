import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class GitHubActionsWebhookDto {
  @ApiProperty({
    description: 'Flui application UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  appId: string;

  @ApiPropertyOptional({
    description: 'Full image reference (only on success)',
    example: 'ghcr.io/user/repo:abc1234',
  })
  @IsOptional()
  @IsString()
  imageRef?: string;

  @ApiProperty({
    description: 'Git commit SHA that triggered this build',
    example: 'abc1234567890',
  })
  @IsString()
  commitSha: string;

  @ApiProperty({ description: 'Branch name', example: 'main' })
  @IsString()
  branch: string;

  @ApiProperty({ description: 'Build outcome', enum: ['success', 'failed'] })
  @IsIn(['success', 'failed'])
  status: 'success' | 'failed';
}
