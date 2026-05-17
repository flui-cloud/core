import { ApiProperty } from '@nestjs/swagger';
import { GitProvider } from '../entities/repository.entity';

export class ConnectRepositoryResponseDto {
  @ApiProperty({ description: 'Repository ID' })
  id: string;

  @ApiProperty({ description: 'Git provider', enum: GitProvider })
  provider: GitProvider;

  @ApiProperty({ description: 'Repository name' })
  repositoryName: string;

  @ApiProperty({ description: 'Full repository name (owner/repo)' })
  repositoryFullName: string;

  @ApiProperty({ description: 'Repository owner' })
  owner: string;

  @ApiProperty({ description: 'Default branch' })
  defaultBranch: string;

  @ApiProperty({ description: 'Whether repository is private' })
  isPrivate: boolean;

  @ApiProperty({ description: 'Clone URL' })
  cloneUrl: string;

  @ApiProperty({ description: 'HTML URL' })
  htmlUrl: string;

  @ApiProperty({ description: 'Repository description' })
  description: string;

  @ApiProperty({ description: 'Primary language' })
  language: string;

  @ApiProperty({ description: 'Whether webhook is active' })
  webhookActive: boolean;

  @ApiProperty({ description: 'Whether auto-deploy is enabled' })
  autoDeployEnabled: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
