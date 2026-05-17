import { IsString, IsUrl, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TriggerStandaloneBuildDto {
  @ApiProperty({
    example: 'https://github.com/owner/repo',
    description: 'GitHub repository URL',
  })
  @IsUrl()
  gitUrl: string;

  @ApiProperty({ example: 'main', description: 'Branch to build' })
  @IsString()
  branch: string;

  @ApiProperty({
    description:
      'Cluster where the app will eventually run (used for wizard validation)',
  })
  @IsUUID()
  targetClusterId: string;

  @ApiPropertyOptional({
    description:
      'Cluster to run the build job on. Defaults to targetClusterId.',
  })
  @IsOptional()
  @IsUUID()
  buildClusterId?: string;
}
