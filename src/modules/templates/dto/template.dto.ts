import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  Matches,
  MaxLength,
} from 'class-validator';

export class TemplateResponseDto {
  @ApiProperty({ example: 'nextjs' }) framework: string;
  @ApiProperty({ example: 'Next.js' }) displayName: string;
  @ApiProperty({ example: 'React framework with App Router...' })
  description: string;
  @ApiProperty({ example: '16' }) version: string;
  @ApiProperty({ example: 'flui-template-nextjs-16' }) repo: string;
  @ApiPropertyOptional({
    example: 'https://github.com/flui-cloud/flui-template-nextjs-16',
  })
  repoUrl?: string;
  @ApiProperty({
    example: 'fullstack',
    enum: ['frontend', 'backend', 'fullstack', 'static'],
  })
  category: string;
  @ApiProperty({ example: 'typescript' }) language: string;
  @ApiProperty({ example: 3000 }) port: number;
  @ApiProperty({ example: '/api/health' }) healthcheckPath: string;
  @ApiProperty({ example: 'npm' }) buildTool: string;
  @ApiProperty({ example: true }) isDefault: boolean;
  @ApiProperty({ example: false }) isDeprecated: boolean;
}

export class DeployTemplateDto {
  @ApiProperty({ description: 'Cluster ID to deploy the template to' })
  @IsUUID()
  clusterId: string;

  @ApiPropertyOptional({ description: 'Application name override' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UseTemplateDto {
  @ApiProperty({
    example: 'my-awesome-app',
    description:
      'Name of the new repository to create. Must be a valid GitHub repo name (alphanumeric, dashes, underscores, dots).',
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'name must contain only letters, numbers, dots, dashes and underscores',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'my-org',
    description:
      "GitHub user or organisation that will own the new repository. Defaults to the authenticated user's GitHub login.",
  })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({
    example: 'A demo app generated from the Flui Next.js template',
    description: 'Optional description for the new repository',
  })
  @IsOptional()
  @IsString()
  @MaxLength(350)
  description?: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description:
      'Whether the new repository should be created as private. Defaults to true.',
  })
  @IsOptional()
  @IsBoolean()
  private?: boolean;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description:
      'When true, includes the full git history of the template. When false (default), only the latest commit is copied.',
  })
  @IsOptional()
  @IsBoolean()
  includeAllBranches?: boolean;
}

export class UseTemplateResponseDto {
  @ApiProperty({ example: 'flui-cloud/flui-template-nextjs-16' })
  templateRepo: string;

  @ApiProperty({ example: 'nextjs' })
  framework: string;

  @ApiProperty({ example: 'dawit/my-awesome-app' })
  fullName: string;

  @ApiProperty({ example: 'dawit' })
  owner: string;

  @ApiProperty({ example: 'my-awesome-app' })
  name: string;

  @ApiProperty({ example: 'https://github.com/dawit/my-awesome-app' })
  htmlUrl: string;

  @ApiProperty({ example: 'https://github.com/dawit/my-awesome-app.git' })
  cloneUrl: string;

  @ApiProperty({ example: 'main' })
  defaultBranch: string;

  @ApiProperty({ example: true })
  private: boolean;

  @ApiProperty({
    example: false,
    description:
      'When true, the GitHub repository already existed before this call (it was generated from the same Flui template by a previous call). The endpoint is idempotent: a retry after a partial failure returns the same repo with this flag set instead of erroring.',
  })
  alreadyExisted: boolean;
}
