import { Injectable } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { IProviderCapabilitiesService } from '../../interfaces/provider-capabilities.interface';
import { CapabilitiesProviderRegistration } from '../tokens';

@Injectable()
export class CapabilitiesProviderFactory {
  private readonly registry = new Map<
    CloudProvider,
    IProviderCapabilitiesService
  >();

  constructor(registrations: CapabilitiesProviderRegistration[]) {
    for (const reg of registrations) {
      this.registry.set(reg.provider, reg.service);
    }
  }

  getCapabilitiesService(
    provider: CloudProvider,
  ): IProviderCapabilitiesService {
    const service = this.registry.get(provider);
    if (!service) {
      throw new Error(
        `Capabilities not registered for provider: ${provider}. Supported: ${this.getSupportedProviders().join(', ')}`,
      );
    }
    return service;
  }

  getSupportedProviders(): CloudProvider[] {
    return Array.from(this.registry.keys());
  }

  isProviderSupported(provider: CloudProvider): boolean {
    return this.registry.has(provider);
  }
}
