import { ApiProperty } from '@nestjs/swagger';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { ProviderCapabilitiesDto } from './provider-capabilities.dto';

export class DnsZoneDelegationDto {
  @ApiProperty({
    description: 'Official guide URL for delegating an external domain',
    example:
      'https://docs.hetzner.com/dns-console/dns/general/delegating-a-domain-to-hetzner-dns/',
  })
  delegationGuideUrl: string;
}

export class ProviderDefinitionDto {
  @ApiProperty({ enum: CloudProvider })
  id: CloudProvider;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  logoUrl: string;

  @ApiProperty()
  websiteUrl: string;

  @ApiProperty()
  documentationUrl: string;

  @ApiProperty({
    description: 'Whether the provider is enabled and available for use',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({ required: false })
  accessKeyDocumentationUrl?: string;

  @ApiProperty({ required: false })
  pricingUrl?: string;

  @ApiProperty()
  capabilities: ProviderCapabilitiesDto;

  @ApiProperty()
  configurationSchema: any;

  @ApiProperty({
    required: false,
    type: DnsZoneDelegationDto,
    description:
      'DNS delegation info — present only for providers that support DNS zones',
  })
  dnsZoneDelegation?: DnsZoneDelegationDto;
}
