import { ApiProperty } from '@nestjs/swagger';

export class GhcrTagDto {
  @ApiProperty({
    example: 12345678,
    description: 'GitHub package version numeric ID',
  })
  versionId: number;

  @ApiProperty({ example: 'sha256:abc123...', description: 'Image digest' })
  digest: string;

  @ApiProperty({
    example: ['a3f9c1d', 'latest'],
    type: [String],
    description: 'Container tags',
  })
  tags: string[];

  @ApiProperty({ description: 'When this version was created on GHCR' })
  createdAt: string;

  @ApiProperty({ description: 'When this version was last updated' })
  updatedAt: string;

  @ApiProperty({ description: 'Link to the version on GitHub Packages' })
  htmlUrl: string;

  @ApiProperty({
    example: 'ghcr.io/acme/flui-web:a3f9c1d',
    description: 'Full pullable image reference',
  })
  imageRef: string;

  @ApiProperty({ description: 'Whether this version is currently deployed' })
  isCurrentlyDeployed: boolean;

  @ApiProperty({
    description: 'Whether a local ImageEntity record exists for this version',
  })
  hasLocalRecord: boolean;

  @ApiProperty({
    required: false,
    description: 'Local image record ID if it exists',
  })
  localImageId?: string;

  @ApiProperty({
    type: [String],
    description: 'Custom Flui tags from local record',
  })
  fluiTags: string[];
}
