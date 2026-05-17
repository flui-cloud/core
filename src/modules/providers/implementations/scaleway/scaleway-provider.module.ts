import { Module } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { DnsProvider } from '../../enums/dns-provider.enum';
import { ScalewayInstancesAdapter } from './scaleway-instances.adapter';
import { ScalewayBareMetalAdapter } from './scaleway-baremetal.adapter';
import { ScalewayProviderService } from './scaleway-provider.service';
import { ScalewayFirewallService } from './scaleway-firewall.service';
import { ScalewayDnsService } from './scaleway-dns.service';
import { ScalewayVpcAdapter } from './scaleway-vpc.adapter';
import { ScalewayIamAdapter } from './scaleway-iam.adapter';
import { ScalewayCapabilitiesService } from './scaleway-capabilities.service';
import { ScalewayObjectStorageBackend } from './object-storage/scaleway-object-storage.backend';
import { ScalewayBootstrapSeeder } from './scaleway-bootstrap-seeder.service';
import { SharedInfrastructureModule } from '../../../infrastructure/shared/shared-infrastructure.module';
import { StorageModule } from '../../../storage/storage.module';
import { StorageBackendProvider } from '../../../storage/enums/storage-backend-provider.enum';
import {
  BACKUP_STORAGE_BACKEND_REGISTRY,
  BackupStorageBackendRegistration,
  multiBackupStorageProvider,
} from '../../../storage/tokens/storage-backend-registry.token';
import {
  CLOUD_PROVIDER_REGISTRY,
  FIREWALL_PROVIDER_REGISTRY,
  DNS_PROVIDER_REGISTRY,
  CAPABILITIES_PROVIDER_REGISTRY,
  CloudProviderRegistration,
  FirewallProviderRegistration,
  DnsProviderRegistration,
  CapabilitiesProviderRegistration,
  multiProvider,
} from '../../core/tokens';

/**
 * Scaleway provider module — auto-registers Scaleway into the global provider registry.
 *
 * Covers both Scaleway Instances (VMs) and Elastic Metal (bare metal) through
 * a unified ScalewayProviderService backed by two internal adapters.
 *
 * Services depend on 'ICredentialProvider' which must be provided globally
 * by the parent module (ProvidersModule / CliProvidersModule marked @Global()).
 *
 * NOTE: questo modulo NON ha dipendenze TypeORM. Per il provisioning automatico
 * di Scaleway Object Storage (DB-dipendente, API only) vedere
 * [ScalewayObjectStorageModule](object-storage/scaleway-object-storage.module.ts).
 *
 * To add Scaleway to the system: import ScalewayProviderModule in ProvidersModule.
 */
@Module({
  imports: [StorageModule, SharedInfrastructureModule],
  providers: [
    ScalewayInstancesAdapter,
    ScalewayBareMetalAdapter,
    ScalewayProviderService,
    ScalewayFirewallService,
    ScalewayDnsService,
    ScalewayVpcAdapter,
    ScalewayIamAdapter,
    ScalewayCapabilitiesService,
    ScalewayObjectStorageBackend,
    ScalewayBootstrapSeeder,

    multiBackupStorageProvider({
      provide: BACKUP_STORAGE_BACKEND_REGISTRY,
      useFactory: (
        s: ScalewayObjectStorageBackend,
      ): BackupStorageBackendRegistration => ({
        provider: StorageBackendProvider.SCALEWAY_OBJECT_STORAGE,
        backend: s,
      }),
      inject: [ScalewayObjectStorageBackend],
      multi: true,
    }),

    multiProvider<CapabilitiesProviderRegistration>({
      provide: CAPABILITIES_PROVIDER_REGISTRY,
      useFactory: (
        s: ScalewayCapabilitiesService,
      ): CapabilitiesProviderRegistration => ({
        provider: CloudProvider.SCALEWAY,
        service: s,
      }),
      inject: [ScalewayCapabilitiesService],
      multi: true,
    }),

    multiProvider<CloudProviderRegistration>({
      provide: CLOUD_PROVIDER_REGISTRY,
      useFactory: (s: ScalewayProviderService): CloudProviderRegistration => ({
        provider: CloudProvider.SCALEWAY,
        service: s,
      }),
      inject: [ScalewayProviderService],
      multi: true,
    }),

    multiProvider<FirewallProviderRegistration>({
      provide: FIREWALL_PROVIDER_REGISTRY,
      useFactory: (
        s: ScalewayFirewallService,
      ): FirewallProviderRegistration => ({
        provider: CloudProvider.SCALEWAY,
        service: s,
      }),
      inject: [ScalewayFirewallService],
      multi: true,
    }),

    multiProvider<DnsProviderRegistration>({
      provide: DNS_PROVIDER_REGISTRY,
      useFactory: (s: ScalewayDnsService): DnsProviderRegistration => ({
        provider: DnsProvider.SCALEWAY,
        service: s,
      }),
      inject: [ScalewayDnsService],
      multi: true,
    }),
  ],
  exports: [
    ScalewayProviderService,
    ScalewayFirewallService,
    ScalewayDnsService,
    ScalewayVpcAdapter,
    ScalewayIamAdapter,
    ScalewayCapabilitiesService,
    ScalewayObjectStorageBackend,
    ScalewayBootstrapSeeder,
    CLOUD_PROVIDER_REGISTRY,
    FIREWALL_PROVIDER_REGISTRY,
    DNS_PROVIDER_REGISTRY,
    CAPABILITIES_PROVIDER_REGISTRY,
    BACKUP_STORAGE_BACKEND_REGISTRY,
  ],
})
export class ScalewayProviderModule {}
