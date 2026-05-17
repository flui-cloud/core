import { ApiProperty } from '@nestjs/swagger';

export class CatalogYamlResponseDto {
  @ApiProperty({ description: 'Catalog app slug' })
  slug: string;

  @ApiProperty({ description: 'Catalog app version' })
  version: string;

  @ApiProperty({
    description:
      'SHA-256 checksum of the canonical manifest, useful for caching/ETag in the FE.',
  })
  checksum: string;

  @ApiProperty({
    description:
      'Raw flui.yaml manifest as authored, byte-for-byte. Intended for an "Advanced / Show YAML" panel in the dashboard.',
  })
  rawYaml: string;
}
