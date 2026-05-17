import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { GitHubAuthMethod } from '../enums/github-auth-method.enum';
import { ApiProperty } from '@nestjs/swagger';

export class GitHubOAuthInitiateResponseDto {
  @ApiProperty({
    description: 'GitHub OAuth authorization URL',
    example: 'https://github.com/login/oauth/authorize?client_id=...',
  })
  url: string;

  @ApiProperty({ description: 'State token for CSRF protection' })
  state: string;
}

export class GitHubOAuthCallbackDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Authorization code from GitHub',
    required: false,
  })
  code?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'State token for CSRF validation',
    required: false,
  })
  state?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Error code if authorization failed',
    required: false,
  })
  error?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Error description', required: false })
  error_description?: string;
}

export class GitHubOAuthStatusResponseDto {
  @ApiProperty({ description: 'Whether GitHub OAuth is connected' })
  connected: boolean;

  @ApiProperty({ description: 'GitHub username', required: false })
  githubUsername?: string;

  @ApiProperty({ description: 'OAuth scopes granted', required: false })
  scopes?: string;

  @ApiProperty({
    description: 'When the connection was created',
    required: false,
  })
  connectedAt?: Date;
}

export class AvailableRepositoryDto {
  @ApiProperty({ description: 'GitHub repository ID' })
  id: string;

  @ApiProperty({ description: 'Repository name' })
  name: string;

  @ApiProperty({ description: 'Full repository name (owner/repo)' })
  fullName: string;

  @ApiProperty({ description: 'Repository owner' })
  owner: string;

  @ApiProperty({ description: 'Repository description' })
  description: string;

  @ApiProperty({ description: 'Default branch name' })
  defaultBranch: string;

  @ApiProperty({ description: 'Whether repository is private' })
  private: boolean;

  @ApiProperty({ description: 'Repository clone URL' })
  cloneUrl: string;

  @ApiProperty({ description: 'Repository HTML URL' })
  htmlUrl: string;

  @ApiProperty({ description: 'Primary language' })
  language: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Whether this repository is already imported' })
  isImported: boolean;
}

export class ImportRepositoriesDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Array of GitHub repository full names (owner/repo) to import',
    example: ['vercel/next.js', 'facebook/react'],
    type: [String],
  })
  repositoryIds: string[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Enable auto-deploy on push for imported repositories',
    required: false,
    default: false,
  })
  autoDeployEnabled?: boolean;
}

export class ConnectPatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @ApiProperty({
    description: 'GitHub Personal Access Token (ghp_xxx or github_pat_xxx)',
    example: 'ghp_xxxxxxxxxxxxxxxxxxxx',
  })
  personalAccessToken: string;
}

export class GitHubSetupOAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'GitHub OAuth App Client ID' })
  clientId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'GitHub OAuth App Client Secret' })
  clientSecret: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'OAuth callback URL (must match the one configured in your GitHub OAuth App)',
    example: 'https://myflui.com/api/v1/repositories/github/callback',
  })
  callbackUrl: string;
}

export class GitHubSetupAppDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'GitHub App ID (numeric string)',
    example: '123456',
  })
  appId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'GitHub App Private Key (PEM format)' })
  privateKey: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Webhook secret configured in the GitHub App settings',
  })
  webhookSecret: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'GitHub App slug (from the app URL)',
    example: 'flui-cloud',
  })
  appSlug: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description:
      'OAuth Client ID of the GitHub App. Required if "Request user authorization (OAuth) during installation" is enabled, so users can connect their own GitHub identity.',
  })
  clientId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'OAuth Client Secret paired with clientId.',
  })
  clientSecret?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description:
      'OAuth callback URL (must match the "Callback URL" set on the GitHub App). Required to start the user-authorization flow.',
    example: 'https://myflui.com/api/v1/repositories/github-app/user-callback',
  })
  callbackUrl?: string;
}

export class GitHubSetupStatusResponseDto {
  @ApiProperty({
    description: 'Whether GitHub integration has been configured',
  })
  configured: boolean;

  @ApiProperty({
    description: 'Selected auth method',
    enum: GitHubAuthMethod,
    nullable: true,
  })
  authMethod: GitHubAuthMethod | null;

  @ApiProperty({
    description:
      'GitHub App slug — use to build the install URL: https://github.com/apps/{appSlug}/installations/new',
    required: false,
    example: 'flui-cloud',
  })
  appSlug?: string;
}

export class ConnectPatResponseDto {
  @ApiProperty()
  connected: boolean;

  @ApiProperty()
  githubUsername: string;
}

export class ImportedRepositoryRefDto {
  @ApiProperty({
    description:
      'Flui Repository UUID — use this as sourceConfig.repositoryId on POST /applications',
  })
  id: string;

  @ApiProperty({
    description: 'GitHub owner/repo full name',
    example: 'dawit-io/nextjs-app',
  })
  fullName: string;

  @ApiProperty({
    description:
      'Whether this repository was newly imported by this call or already existed',
    enum: ['imported', 'already_imported'],
    example: 'imported',
  })
  status: 'imported' | 'already_imported';
}

export class ImportRepositoriesResponseDto {
  @ApiProperty({
    description: 'Number of repositories newly created by this call',
  })
  imported: number;

  @ApiProperty({
    description:
      'Number of repositories skipped because they were already imported (not an error — their UUIDs are still returned in `repositories`)',
  })
  skipped: number;

  @ApiProperty({ description: 'Number of repositories that failed to import' })
  failed: number;

  @ApiProperty({
    type: [ImportedRepositoryRefDto],
    description:
      'All repositories that are now available after this call — both newly imported and already-existing ones. ' +
      'Use the `id` field as `sourceConfig.repositoryId` for POST /applications.',
  })
  repositories: ImportedRepositoryRefDto[];

  @ApiProperty({
    description:
      'Array of Flui Repository UUIDs (newly imported + already imported). Same as `repositories[].id`.',
    type: [String],
  })
  importedRepositoryIds: string[];

  @ApiProperty({
    description: 'Array of error messages for failed imports',
    required: false,
  })
  errors?: string[];
}

export class PublicRepoSearchResultDto {
  @ApiProperty({ description: 'Repository name' })
  name: string;

  @ApiProperty({ description: 'Full repository name (owner/repo)' })
  full_name: string;

  @ApiProperty({ description: 'Repository description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Number of stars' })
  stars: number;

  @ApiProperty({ description: 'Primary language', nullable: true })
  language: string | null;

  @ApiProperty({ description: 'Default branch name' })
  default_branch: string;

  @ApiProperty({ description: 'HTTPS clone URL' })
  clone_url: string;

  @ApiProperty({ description: 'Repository HTML URL' })
  html_url: string;

  @ApiProperty({ description: 'Always false for public repos', default: false })
  is_private: false;
}

export class PublicRepoBranchDto {
  @ApiProperty({ description: 'Branch name' })
  name: string;

  @ApiProperty({ description: 'HEAD commit SHA' })
  sha: string;
}
