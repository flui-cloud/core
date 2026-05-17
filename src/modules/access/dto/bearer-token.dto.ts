import { ApiProperty } from '@nestjs/swagger';

export class BearerTokenDto {
  @ApiProperty({ description: 'Access token for API authentication' })
  access_token: string;

  @ApiProperty({ description: 'Type of token (usually Bearer)' })
  token_type: string;

  @ApiProperty({ description: 'Token expiration in seconds', required: false })
  expires_in?: number;

  @ApiProperty({ description: 'Refresh token (if available)', required: false })
  refresh_token?: string;

  @ApiProperty({ description: 'Scope of the token', required: false })
  scope?: string;
}
