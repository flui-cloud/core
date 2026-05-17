import { ApiProperty } from '@nestjs/swagger';

/**
 * Base DTO for async infrastructure operations
 *
 * Provides unified tracking interface for long-running operations across:
 * - Cluster creation/deletion
 * - Build agent provisioning
 * - Server creation/deletion
 * - Deployment operations
 *
 * This allows frontend to use a single component/hook for monitoring
 * any async infrastructure operation via the operation_id.
 */
export class AsyncOperationResponseDto {
  @ApiProperty({
    description:
      'Operation ID for tracking progress via /api/v1/infrastructure/operations/:id',
    example: 'a7f8c3d2-1234-5678-90ab-cdef12345678',
  })
  operation_id: string;

  @ApiProperty({
    description: 'Created resource ID (cluster/agent/server)',
    example: 'b9e2d4f1-5678-1234-90ab-cdef87654321',
  })
  resource_id: string;

  @ApiProperty({
    description: 'Initial operation status',
    enum: ['pending'],
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Estimated time to complete the operation',
    example: '5-10 minutes',
  })
  estimated_duration: string;

  @ApiProperty({
    description: 'Timestamp when the operation was created',
    type: Date,
    example: '2025-11-09T10:30:00Z',
  })
  created_at: Date;
}
