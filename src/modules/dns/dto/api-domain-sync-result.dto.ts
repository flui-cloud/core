import { ApiProperty } from '@nestjs/swagger';

export class ApiDomainSyncResultDto {
  @ApiProperty({ description: 'FQDN resolved for flui-api' })
  apiDomain: string;

  @ApiProperty({ description: 'FQDN resolved for flui-web' })
  webDomain: string;

  @ApiProperty({ description: 'FQDN resolved for zitadel (auth issuer)' })
  authDomain: string;

  @ApiProperty({
    description: 'Whether flui-secrets was patched with the new values',
  })
  secretsPatched: boolean;

  @ApiProperty({
    description:
      'Whether flui-api-config ConfigMap was updated with the new OIDC_ISSUER',
  })
  configMapPatched: boolean;

  @ApiProperty({
    description: 'Whether the flui-api deployment restart was triggered',
  })
  deploymentRestarted: boolean;
}
