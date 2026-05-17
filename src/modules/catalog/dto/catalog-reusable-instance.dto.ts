import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../../applications/enums/application-status.enum';

export class CatalogReusableInstanceDto {
  @ApiProperty({
    description:
      'ApplicationEntity id to pass in dependencyChoices.existingApplicationId',
  })
  applicationId: string;

  @ApiPropertyOptional({
    description:
      'CatalogInstallEntity id of the building block. Pass this as `targetInstallId` in the body of POST /catalog/installs/:client-install-id/connect to wire the client to this BB. Undefined in the rare case where the application was not created via catalog-install (e.g. imported).',
  })
  catalogInstallId?: string;

  @ApiProperty() applicationName: string;

  @ApiProperty({
    description: 'Catalog slug of the building block (e.g. "postgresql")',
  })
  catalogSlug: string;

  @ApiProperty() displayName: string;

  @ApiProperty({ enum: ApplicationStatus }) status: ApplicationStatus;

  @ApiProperty() createdAt: Date;
}
