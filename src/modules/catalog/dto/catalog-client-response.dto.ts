import { ApiProperty } from '@nestjs/swagger';
import { CatalogResponseDto } from './catalog-response.dto';

/**
 * Response shape of `GET /catalog/:slug/clients`. Adds `isDefault`, computed
 * server-side from the per-BB `metadata.clientDefaultFor` list, so the FE can
 * pre-select the recommended client in a picker without re-deriving it from
 * the array.
 */
export class CatalogClientResponseDto extends CatalogResponseDto {
  @ApiProperty({
    description:
      "True when the queried building-block slug is in this client's metadata.clientDefaultFor. The FE should pre-select the entry with isDefault=true when offering the user a list of compatible clients.",
    example: true,
  })
  isDefault: boolean;
}
