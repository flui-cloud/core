import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncWebDomainDto {
  @ApiProperty({
    description:
      'Application ID of the flui-api app (to read its FQDN for apiUrl)',
    example: '00000000-0000-0000-0000-000000000001',
  })
  @IsUUID()
  fluiApiApplicationId: string;

  @ApiProperty({
    description: 'Application ID of the flui-web app (to read its FQDN)',
    example: '00000000-0000-0000-0000-000000000002',
  })
  @IsUUID()
  fluiWebApplicationId: string;

  @ApiPropertyOptional({
    description:
      'Application ID of the zitadel app. Only present when the cluster runs in OIDC auth mode.',
    example: '00000000-0000-0000-0000-000000000003',
  })
  @IsOptional()
  @IsUUID()
  zitadelApplicationId?: string;
}
