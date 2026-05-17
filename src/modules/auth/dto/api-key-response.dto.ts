import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  revoked: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  expiresAt: Date | null;
}

export class CreateApiKeyResultDto extends ApiKeyResponseDto {
  @ApiProperty({
    description: 'Plaintext API key — shown only once at creation time.',
  })
  key: string;
}
