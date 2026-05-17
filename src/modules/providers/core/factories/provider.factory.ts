import { Injectable, Inject, Optional } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { ICloudProvider } from '../../interfaces/cloud-provider.interface';
import { CLOUD_PROVIDER_REGISTRY, CloudProviderRegistration } from '../tokens';

@Injectable()
export class ProviderFactory {
  private readonly registry = new Map<CloudProvider, ICloudProvider>();

  constructor(
    @Optional()
    @Inject(CLOUD_PROVIDER_REGISTRY)
    registrations:
      | CloudProviderRegistration
      | CloudProviderRegistration[]
      | null,
  ) {
    let list: CloudProviderRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.service);
    }
  }

  getProvider(provider: CloudProvider): ICloudProvider {
    const service = this.registry.get(provider);
    if (!service) {
      throw new Error(
        `Provider ${provider} not supported. Supported: ${this.getSupportedProviders().join(', ')}`,
      );
    }
    return service;
  }

  getSupportedProviders(): CloudProvider[] {
    return Array.from(this.registry.keys());
  }
}
