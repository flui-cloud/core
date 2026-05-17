import { ApiProperty } from '@nestjs/swagger';

export class OidcReadinessDto {
  @ApiProperty({
    description:
      'True when the OIDC client has been provisioned in the identity provider and the API has the audience/client_id configured',
    example: true,
  })
  ready: boolean;
}
