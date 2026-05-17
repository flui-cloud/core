import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

/**
 * DTO for updating node metadata
 */
export class UpdateNodeMetadataDto {
  @ApiProperty({
    description: 'Metadata object to merge with existing node metadata',
    example: {
      registered: true,
      registeredAt: '2025-12-30T18:00:00Z',
      customLabel: 'worker-01',
    },
  })
  @IsObject()
  metadata: Record<string, any>;
}
