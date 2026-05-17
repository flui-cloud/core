import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SyncAuthDomainDto {
  @ApiProperty({
    description:
      'Application ID of flui-web. Used to resolve the web FQDN and register the matching redirect URIs on the Zitadel OIDC application.',
  })
  @IsUUID()
  fluiWebApplicationId: string;
}
