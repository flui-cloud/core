import { ApiProperty } from '@nestjs/swagger';

export class AuthDomainSyncResultDto {
  @ApiProperty({ description: 'Previous auth domain (before sync)' })
  previousDomain: string;

  @ApiProperty({ description: 'New auth domain (after sync)' })
  newDomain: string;

  @ApiProperty({
    description:
      'Whether the Kubernetes ConfigMap was updated with the new ExternalDomain',
  })
  configMapUpdated: boolean;

  @ApiProperty({
    description: 'Whether the auth deployment restart was triggered',
  })
  deploymentRestarted: boolean;

  @ApiProperty({
    description:
      'Whether the Zitadel PAT was freshly injected into flui-secrets during this call',
    required: false,
  })
  patInjected?: boolean;

  @ApiProperty({
    description:
      'Whether the Zitadel OIDC application was patched with the new redirect URIs',
  })
  zitadelAppPatched: boolean;

  @ApiProperty({
    description: 'Redirect URIs added to the Zitadel OIDC application',
    type: [String],
  })
  redirectUrisAdded: string[];

  @ApiProperty({
    description:
      'Post-logout redirect URIs added to the Zitadel OIDC application',
    type: [String],
  })
  postLogoutUrisAdded: string[];
}
