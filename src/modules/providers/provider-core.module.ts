import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { CertificateProviderFactory } from './core/factories/certificate-provider.factory';
import { CERTIFICATE_PROVIDER_REGISTRY } from './core/tokens';
import { CertificateProvider } from './enums/certificate-provider.enum';
import { NodeSizeMapper } from './mappers/node-size.mapper';
import { PricingMapper } from './mappers/pricing.mapper';
import { AcmeCertificateService } from './services/acme-certificate.service';

/**
 * Shared provider core module — contains only components with no storage dependencies.
 * Used by both ProvidersModule (API) and CliProvidersModule (CLI).
 *
 * @Global() makes NodeSizeMapper, PricingMapper, LabelService (via CommonModule),
 * CacheService, and ConfigService available to all provider implementation modules
 * (HetznerProviderModule, ContaboProviderModule, etc.) without explicit imports.
 *
 * Does NOT include cloud provider services (Hetzner, Contabo) because they depend
 * on ICredentialProvider which differs between API (DB) and CLI (file).
 */
@Global()
@Module({
  imports: [ConfigModule, CommonModule],
  providers: [
    NodeSizeMapper,
    PricingMapper,
    AcmeCertificateService,
    {
      provide: CERTIFICATE_PROVIDER_REGISTRY,
      useFactory: (service: AcmeCertificateService) => [
        { provider: CertificateProvider.LETS_ENCRYPT, service },
        { provider: CertificateProvider.LETS_ENCRYPT_STAGING, service },
      ],
      inject: [AcmeCertificateService],
    },
    CertificateProviderFactory,
  ],
  exports: [
    CommonModule,
    NodeSizeMapper,
    PricingMapper,
    AcmeCertificateService,
    CertificateProviderFactory,
  ],
})
export class ProviderCoreModule {}
