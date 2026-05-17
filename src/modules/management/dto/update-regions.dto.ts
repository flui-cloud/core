import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UpdateProviderRegionsDto {
  @ApiProperty({
    description: 'List of region IDs to enable for this provider',
    type: [String],
    example: ['fr-par', 'nl-ams'],
  })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  enabledRegions: string[];
}
