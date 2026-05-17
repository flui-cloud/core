import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { ProviderCapabilities } from './provider-capabilities.entity';
import {
  ProviderCredentialFields,
  DnsZoneDelegation,
} from '../../providers/interfaces/provider-capabilities.interface';

export interface ProviderDefinition {
  id: CloudProvider;
  name: string;
  displayName: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  documentationUrl: string;
  accessKeyDocumentationUrl?: string;
  supportUrl?: string;
  pricingUrl?: string;
  enabled: boolean;
  capabilities: ProviderCapabilities;
  credentialFields: ProviderCredentialFields;
  dnsZoneDelegation?: DnsZoneDelegation;
}
