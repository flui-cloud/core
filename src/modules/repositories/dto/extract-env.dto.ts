import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ExtractEnvDto {
  @ApiProperty({
    description: 'Branch to clone and scan',
    example: 'main',
  })
  @IsString()
  branch: string;

  @ApiProperty({
    description: 'Confirmed framework name (e.g. nextjs, spring-boot, django)',
    example: 'nestjs',
  })
  @IsString()
  framework: string;
}

export class ExtractedEnvVarDto {
  @ApiProperty({
    description: 'Environment variable key',
    example: 'DATABASE_URL',
  })
  key: string;

  @ApiProperty({
    description: 'Source file the variable was extracted from',
    example: '.env.example',
  })
  source: string;

  @ApiProperty({
    description: 'Whether a default value is present',
    example: false,
  })
  hasDefault: boolean;

  @ApiProperty({
    description: 'Default value if present',
    example: 'postgres://localhost/mydb',
    required: false,
  })
  defaultValue?: string;

  @ApiProperty({
    description: 'Whether this variable is likely a secret',
    example: true,
  })
  suggestedSecret: boolean;
}
