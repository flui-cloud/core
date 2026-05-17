import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsISO8601,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'smoke-test' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @ApiPropertyOptional({
    example: '2027-01-01T00:00:00.000Z',
    description: 'ISO 8601 expiry date. Omit for no expiry.',
  })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
