import {
  BadRequestException,
  Injectable,
  Inject,
  Optional,
  Logger,
} from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { IFirewallProvider } from '../../interfaces/firewall-provider.interface';
import {
  FIREWALL_PROVIDER_REGISTRY,
  FirewallProviderRegistration,
} from '../tokens';

@Injectable()
export class FirewallProviderFactory {
  private readonly logger = new Logger(FirewallProviderFactory.name);
  private readonly registry = new Map<CloudProvider, IFirewallProvider>();

  constructor(
    @Optional()
    @Inject(FIREWALL_PROVIDER_REGISTRY)
    registrations:
      | FirewallProviderRegistration
      | FirewallProviderRegistration[]
      | null,
  ) {
    let list: FirewallProviderRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.service);
    }
  }

  getFirewallProvider(provider: CloudProvider): IFirewallProvider | null {
    const service = this.registry.get(provider);
    if (!service) {
      this.logger.warn(`No firewall provider registered for: ${provider}.`);
      return null;
    }
    return service;
  }

  supportsFirewall(provider: CloudProvider): boolean {
    return this.registry.has(provider);
  }

  getFirewallProviderOrFail(provider: CloudProvider): IFirewallProvider {
    const service = this.registry.get(provider);
    if (!service) {
      throw new BadRequestException(
        `Firewall management is not supported for provider: ${provider}. ` +
          `Supported providers: ${this.getSupportedProviders().join(', ')}`,
      );
    }
    return service;
  }

  getSupportedProviders(): CloudProvider[] {
    return Array.from(this.registry.keys());
  }
}
