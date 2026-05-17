import { ApiProperty } from '@nestjs/swagger';

export class WebDomainSyncResultDto {
  @ApiProperty({ description: 'FQDN used as apiBaseUrl in flui-web-config' })
  apiDomain: string;

  @ApiProperty({
    description:
      'FQDN of the auth issuer (Zitadel) used to set oidcIssuer in flui-web-config when authMode is oidc; empty in local mode',
  })
  authDomain: string;

  @ApiProperty({
    description: 'Whether the flui-web-config ConfigMap was updated',
  })
  configMapUpdated: boolean;

  @ApiProperty({
    description: 'Whether the flui-web deployment restart was triggered',
  })
  deploymentRestarted: boolean;
}
