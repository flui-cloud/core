import { ApiProperty } from '@nestjs/swagger';

export class ConfigureAuthModeResultDto {
  @ApiProperty({
    description: 'Auth mode active before this call',
    example: 'oidc',
  })
  previousAuthMode: string;

  @ApiProperty({
    description: 'Auth mode active after this call',
    example: 'local',
  })
  newAuthMode: string;

  @ApiProperty({
    description: 'Whether flui-secrets was patched with the new credentials',
  })
  secretPatched: boolean;

  @ApiProperty({
    description:
      'Whether flui-api-config ConfigMap was updated with the new AUTH_MODE',
  })
  apiConfigMapPatched: boolean;

  @ApiProperty({
    description:
      'Whether flui-web-config ConfigMap was updated with the new authMode',
  })
  webConfigMapPatched: boolean;

  @ApiProperty({
    description: 'Whether the flui-api deployment restart was triggered',
  })
  apiDeploymentRestarted: boolean;

  @ApiProperty({
    description: 'Whether the flui-web deployment restart was triggered',
  })
  webDeploymentRestarted: boolean;

  @ApiProperty({
    description: 'API key for CLI M2M access (local mode only, shown once)',
    required: false,
  })
  apiKey?: string;
}
