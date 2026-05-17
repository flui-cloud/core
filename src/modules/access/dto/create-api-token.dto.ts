import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApiTokenDto {
  @ApiProperty({
    description: 'API provider name',
    example: 'Hetzner',
  })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'API token from the provider',
    example: 'hcloud_1a2b3c4d5e6f7g8h9i0j',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Label for this API token',
    example: 'Production Hetzner Account',
  })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiPropertyOptional({
    description: 'Notes about this API token',
    example: 'Used for infrastructure in EU region',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Optional expiry date of the key, if set by the user',
    example: '2027-03-14T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
