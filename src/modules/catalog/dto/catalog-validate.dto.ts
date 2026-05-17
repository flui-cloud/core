import { IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogManifest } from '../interfaces/catalog-manifest.interface';
import { CatalogDetailResponseDto } from './catalog-detail-response.dto';

export class CatalogValidateRequestDto {
  @ApiProperty({
    description: 'Raw flui.yaml manifest as a YAML string',
    example: 'kind: CatalogApp\napiVersion: flui/v1\nmetadata:\n  id: ...',
  })
  @IsString()
  @MinLength(10)
  yaml: string;
}

export class CatalogValidateResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional({ type: [String] })
  errors?: string[];

  @ApiPropertyOptional({
    description:
      'Parsed canonical manifest. Present only when valid=true. Same shape that would be persisted in catalog_app_definitions.manifest.',
  })
  manifest?: CatalogManifest;

  @ApiPropertyOptional({
    description:
      'sha256 of the canonical JSON serialization of the parsed manifest. Present only when valid=true.',
  })
  checksum?: string;

  @ApiPropertyOptional({
    description:
      'Same shape the dashboard uses for the GET /catalog/:slug detail endpoint. Lets the caller preview how the app card would render without committing.',
    type: CatalogDetailResponseDto,
  })
  preview?: CatalogDetailResponseDto;
}
