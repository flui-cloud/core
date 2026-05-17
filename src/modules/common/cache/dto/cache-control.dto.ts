import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for cache control query parameters
 */
export class CacheControlDto {
  @ApiProperty({
    description:
      'Skip cache and fetch fresh data from provider. Useful for debugging or forcing refresh.',
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  })
  skipCache?: boolean;
}
