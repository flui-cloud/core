import { ApiProperty } from '@nestjs/swagger';

export class ProviderErrorDto {
  @ApiProperty({
    description: 'Provider identifier',
    example: 'hetzner',
  })
  provider: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Authentication failed',
  })
  message: string;

  constructor(provider: string, message: string) {
    this.provider = provider;
    this.message = message;
  }
}
