import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

/**
 * DTO for updating cluster metadata
 */
export class UpdateClusterMetadataDto {
  @ApiProperty({
    description: 'Metadata object to merge with existing metadata',
    example: {
      isObservabilityCluster: true,
      purpose: 'monitoring',
      customField: 'value',
    },
  })
  @IsObject()
  metadata: Record<string, any>;
}
