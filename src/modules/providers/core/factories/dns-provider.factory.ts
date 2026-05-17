import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { DnsProvider } from '../../enums/dns-provider.enum';
import { IDnsProvider } from '../../interfaces/dns-provider.interface';
import { DNS_PROVIDER_REGISTRY, DnsProviderRegistration } from '../tokens';

@Injectable()
export class DnsProviderFactory {
  private readonly logger = new Logger(DnsProviderFactory.name);
  private readonly registry = new Map<DnsProvider, IDnsProvider>();

  constructor(
    @Optional()
    @Inject(DNS_PROVIDER_REGISTRY)
    registrations: DnsProviderRegistration | DnsProviderRegistration[] | null,
  ) {
    let list: DnsProviderRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.service);
    }
  }

  getDnsProvider(provider: DnsProvider): IDnsProvider | null {
    if (provider === DnsProvider.NONE) {
      return null;
    }
    const service = this.registry.get(provider);
    if (!service) {
      this.logger.warn(
        `Unknown DNS provider: ${provider}. No DNS support available.`,
      );
      return null;
    }
    return service;
  }

  supportsDns(provider: DnsProvider): boolean {
    return provider !== DnsProvider.NONE && this.registry.has(provider);
  }

  getDnsProviderOrFail(provider: DnsProvider): IDnsProvider {
    const dnsProvider = this.getDnsProvider(provider);
    if (!dnsProvider) {
      throw new Error(
        `DNS management is not supported for provider: ${provider}. ` +
          `Supported providers: ${this.getSupportedProviders().join(', ')}`,
      );
    }
    return dnsProvider;
  }

  getSupportedProviders(): DnsProvider[] {
    return Array.from(this.registry.keys());
  }
}
