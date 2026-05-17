import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationKind } from '../../applications/enums/application-kind.enum';
import { CatalogAppType } from '../enums/catalog-app-type.enum';
import {
  CatalogLinks,
  CatalogRatings,
} from '../interfaces/catalog-manifest.interface';

export class CatalogResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty() version: string;
  @ApiProperty() category: string;
  @ApiProperty({
    enum: ApplicationKind,
    description:
      'Macro-category for top-level menu placement (DATABASE, APPLICATION, TOOL, SYSTEM).',
  })
  appKind: ApplicationKind;
  @ApiProperty({ enum: CatalogAppType }) appType: CatalogAppType;
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() license?: string;
  @ApiPropertyOptional() iconUrl?: string;
  @ApiPropertyOptional() links?: CatalogLinks;
  @ApiPropertyOptional() ratings?: CatalogRatings;
  @ApiProperty({ type: [String] }) alternativeTo: string[];

  @ApiPropertyOptional({
    description:
      'ISO date (YYYY-MM-DD) of the last time this catalog manifest was reviewed or edited. Dashboards can use this to show "Maintained N months ago" and warn about stale entries.',
    example: '2026-04-19',
  })
  maintainedAt?: string;

  @ApiPropertyOptional({
    description:
      'Path to append to the resolvedFqdn when building the "Open app" link. Default "/". Use to redirect users past the root when the root does not serve a UI (e.g. PocketBase → "/_/", Jupyter → "/lab"). Frontend MUST honor this: href = https://${resolvedFqdn}${entrypointPath ?? "/"}',
    example: '/_/',
    default: '/',
  })
  entrypointPath?: string;

  @ApiProperty({
    type: [String],
    description:
      'Building-block slugs this app is a client of (e.g. pgweb → ["postgresql"], dbgate → ["mariadb","postgresql","valkey"]). Empty array if not a client.',
    example: ['postgresql'],
  })
  clientFor: string[];

  @ApiProperty({
    type: [String],
    description:
      'Subset of clientFor: BB slugs for which this app is the recommended/default client. The dashboard pre-selects the default in a "pick a client" picker.',
    example: ['postgresql'],
  })
  clientDefaultFor: string[];
}
