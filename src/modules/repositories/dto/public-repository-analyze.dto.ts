import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, Matches } from 'class-validator';

export class PublicRepositoryAnalyzeDto {
  @ApiProperty({
    description: 'Public GitHub HTTPS clone URL',
    example: 'https://github.com/vercel/next.js.git',
  })
  @IsString()
  @IsUrl({ protocols: ['https'], require_tld: true })
  @Matches(/^https:\/\/github\.com\//, {
    message:
      'cloneUrl must be a public GitHub HTTPS URL (https://github.com/...)',
  })
  cloneUrl: string;

  @ApiPropertyOptional({
    description:
      'Branch to analyze. Defaults to the repository default branch if not specified.',
    example: 'main',
  })
  @IsOptional()
  @IsString()
  branch?: string;
}
