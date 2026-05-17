import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { CertificateProvider } from '../../enums/certificate-provider.enum';
import { ICertificateProvider } from '../../interfaces/certificate-provider.interface';
import {
  CERTIFICATE_PROVIDER_REGISTRY,
  CertificateProviderRegistration,
} from '../tokens';

@Injectable()
export class CertificateProviderFactory {
  private readonly logger = new Logger(CertificateProviderFactory.name);
  private readonly registry = new Map<
    CertificateProvider,
    ICertificateProvider
  >();

  constructor(
    @Optional()
    @Inject(CERTIFICATE_PROVIDER_REGISTRY)
    registrations:
      | CertificateProviderRegistration
      | CertificateProviderRegistration[]
      | null,
  ) {
    let list: CertificateProviderRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.service);
    }
  }

  getCertificateProvider(
    provider: CertificateProvider,
  ): ICertificateProvider | null {
    const service = this.registry.get(provider);
    if (!service) {
      this.logger.warn(
        `Unknown certificate provider: ${provider}. No certificate support available.`,
      );
      return null;
    }
    return service;
  }

  getCertificateProviderOrFail(
    provider: CertificateProvider,
  ): ICertificateProvider {
    const certProvider = this.getCertificateProvider(provider);
    if (!certProvider) {
      throw new Error(
        `Certificate management is not supported for provider: ${provider}. ` +
          `Supported providers: ${this.getSupportedProviders().join(', ')}`,
      );
    }
    return certProvider;
  }

  getSupportedProviders(): CertificateProvider[] {
    return Array.from(this.registry.keys());
  }
}
