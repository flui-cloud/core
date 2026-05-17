import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class DeployFromYamlDto {
  @ApiProperty({ description: 'Raw flui.yaml content (kind: Application)' })
  @IsString()
  @IsNotEmpty()
  yaml: string;

  @ApiProperty({ description: 'Target cluster UUID' })
  @IsUUID()
  clusterId: string;

  @ApiProperty({
    description: 'GitHub repository full name (owner/repo)',
    example: 'acme/my-astro-app',
  })
  @IsString()
  @IsNotEmpty()
  repoFullName: string;

  @ApiPropertyOptional({
    description: 'Git branch to deploy from',
    default: 'main',
  })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional({
    description: 'Environment variable overrides (KEY=value map)',
    example: { DATABASE_URL: 'postgres://...' },
  })
  @IsOptional()
  envOverrides?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Validate manifest without triggering a deploy',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean;

  @ApiPropertyOptional({
    description:
      'Skip the GitHub Actions build step and re-deploy the current imageRef. ' +
      'Useful for fast iterations on the manifest config (env, ports, healthcheck, endpoint) ' +
      'without rebuilding the image. ' +
      'If the app was deleted, falls back to GHCR latest-tag lookup for {owner}/{repoName}.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skipBuild?: boolean;

  @ApiPropertyOptional({
    description:
      'Explicit image reference to deploy (e.g. ghcr.io/owner/repo:sha). ' +
      'Skips the build pipeline. Takes precedence over skipBuild auto-discovery. ' +
      'Use for rollback to a specific tag, or to deploy a known image when the app was deleted from Flui.',
    example: 'ghcr.io/dawit-io/flui-astro-test:ea9f0cc',
  })
  @IsOptional()
  @IsString()
  imageRef?: string;
}

export class DeployFromYamlResponseDto {
  @ApiProperty() applicationId: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() workflowRunUrl?: string;
  @ApiPropertyOptional() workflowUrl?: string;
  @ApiPropertyOptional({
    description: 'Set when skipBuild=true — track via /operations/:id',
  })
  operationId?: string;
}
