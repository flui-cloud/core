import { Global, Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialProviderService } from './services/credential-provider.service';
import { ProviderCredentialsRepository } from '../access/repositories/provider-credentials.repository';
import { ApiTokenRepository } from '../access/repositories/api-token.repository';
import { ProviderCredentialsEntity } from '../access/entities/credentials.entity';
import { ApiTokenEntity } from '../access/entities/api-token.entity';
import { ClusterEntity } from '../infrastructure/clusters/entities/cluster.entity';
import { ProviderFirewallsController } from './controllers/provider-firewalls.controller';
import { AccessModule } from '../access/access.module';
import { ProviderCoreModule } from './provider-core.module';
import { CommonModule } from '../common/common.module';
import { SharedInfrastructureModule } from '../infrastructure/shared/shared-infrastructure.module';
import { HetznerProviderModule } from './implementations/hetzner/hetzner-provider.module';
import { HetznerObjectStorageModule } from './implementations/hetzner/object-storage/hetzner-object-storage.module';
import { ContaboProviderModule } from './implementations/contabo/contabo-provider.module';
import { ScalewayProviderModule } from './implementations/scaleway/scaleway-provider.module';
import { ScalewayObjectStorageModule } from './implementations/scaleway/object-storage/scaleway-object-storage.module';
import { ProviderFactory } from './core/factories/provider.factory';
import { FirewallProviderFactory } from './core/factories/firewall-provider.factory';
import { DnsProviderFactory } from './core/factories/dns-provider.factory';
import { CapabilitiesProviderFactory } from './core/factories/capabilities-provider.factory';
import { VolumeExportFactory } from './core/factories/volume-export.factory';
import { ObjectStorageProvisionerFactory } from '../storage/factories/object-storage-provisioner.factory';
import { StorageBackendProvider } from '../storage/enums/storage-backend-provider.enum';
import { HetznerObjectStorageProvisioner } from './implementations/hetzner/object-storage/hetzner-object-storage.provisioner';
import { ScalewayObjectStorageProvisioner } from './implementations/scaleway/object-storage/scaleway-object-storage.provisioner';
import { VolumeExportService } from './services/volume-export.service';
import { HetznerCapabilitiesService } from './implementations/hetzner/hetzner-capabilities.service';
import { ContaboCapabilitiesService } from './implementations/contabo/contabo-capabilities.service';
import { ScalewayCapabilitiesService } from './implementations/scaleway/scaleway-capabilities.service';
import { HetznerProviderService } from './services/hetzner-provider.service';
import { HetznerFirewallService } from './services/hetzner-firewall.service';
import { HetznerDnsService } from './services/hetzner-dns.service';
import { ContaboProviderService } from './services/contabo-provider.service';
import { ContaboFirewallService } from './services/contabo-firewall.service';

import { ScalewayProviderService } from './implementations/scaleway/scaleway-provider.service';
import { ScalewayFirewallService } from './implementations/scaleway/scaleway-firewall.service';
import { ScalewayDnsService } from './implementations/scaleway/scaleway-dns.service';
import { HetznerBootstrapSeeder } from './implementations/hetzner/hetzner-bootstrap-seeder.service';
import { ScalewayBootstrapSeeder } from './implementations/scaleway/scaleway-bootstrap-seeder.service';
import {
  PROVIDER_BOOTSTRAP_SEEDER_REGISTRY,
  ProviderBootstrapSeederRegistration,
} from './core/tokens';
import { CloudProvider } from './enums/cloud-provider.enum';
import { DnsProvider } from './enums/dns-provider.enum';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ProviderCredentialsEntity,
      ApiTokenEntity,
      ClusterEntity,
    ]),
    ProviderCoreModule,
    CommonModule,
    SharedInfrastructureModule,
    forwardRef(() => AccessModule),
    HetznerProviderModule,
    HetznerObjectStorageModule,
    ContaboProviderModule,
    ScalewayProviderModule,
    ScalewayObjectStorageModule,
  ],
  controllers: [ProviderFirewallsController],
  providers: [
    ProviderCredentialsRepository,
    ApiTokenRepository,
    CredentialProviderService,
    {
      provide: 'ICredentialProvider',
      useExisting: CredentialProviderService,
    },
    {
      provide: ProviderFactory,
      useFactory: (
        hetzner: HetznerProviderService,
        contabo: ContaboProviderService,
        scaleway: ScalewayProviderService,
      ) =>
        new ProviderFactory([
          { provider: CloudProvider.HETZNER, service: hetzner },
          { provider: CloudProvider.CONTABO, service: contabo },
          { provider: CloudProvider.SCALEWAY, service: scaleway },
        ]),
      inject: [
        HetznerProviderService,
        ContaboProviderService,
        ScalewayProviderService,
      ],
    },
    {
      provide: FirewallProviderFactory,
      useFactory: (
        hetzner: HetznerFirewallService,
        contabo: ContaboFirewallService,
        scaleway: ScalewayFirewallService,
      ) =>
        new FirewallProviderFactory([
          { provider: CloudProvider.HETZNER, service: hetzner },
          { provider: CloudProvider.CONTABO, service: contabo },
          { provider: CloudProvider.SCALEWAY, service: scaleway },
        ]),
      inject: [
        HetznerFirewallService,
        ContaboFirewallService,
        ScalewayFirewallService,
      ],
    },
    {
      provide: DnsProviderFactory,
      useFactory: (hetzner: HetznerDnsService, scaleway: ScalewayDnsService) =>
        new DnsProviderFactory([
          { provider: DnsProvider.HETZNER, service: hetzner },
          { provider: DnsProvider.SCALEWAY, service: scaleway },
        ]),
      inject: [HetznerDnsService, ScalewayDnsService],
    },
    {
      provide: CapabilitiesProviderFactory,
      useFactory: (
        hetzner: HetznerCapabilitiesService,
        contabo: ContaboCapabilitiesService,
        scaleway: ScalewayCapabilitiesService,
      ) =>
        new CapabilitiesProviderFactory([
          { provider: CloudProvider.HETZNER, service: hetzner },
          { provider: CloudProvider.CONTABO, service: contabo },
          { provider: CloudProvider.SCALEWAY, service: scaleway },
        ]),
      inject: [
        HetznerCapabilitiesService,
        ContaboCapabilitiesService,
        ScalewayCapabilitiesService,
      ],
    },
    VolumeExportService,
    {
      provide: ObjectStorageProvisionerFactory,
      useFactory: (
        hetzner: HetznerObjectStorageProvisioner,
        scaleway: ScalewayObjectStorageProvisioner,
      ) =>
        new ObjectStorageProvisionerFactory([
          {
            provider: StorageBackendProvider.HETZNER_OBJECT_STORAGE,
            provisioner: hetzner,
          },
          {
            provider: StorageBackendProvider.SCALEWAY_OBJECT_STORAGE,
            provisioner: scaleway,
          },
        ]),
      inject: [
        HetznerObjectStorageProvisioner,
        ScalewayObjectStorageProvisioner,
      ],
    },
    {
      provide: VolumeExportFactory,
      useFactory: (universal: VolumeExportService) =>
        new VolumeExportFactory([
          { provider: CloudProvider.HETZNER, service: universal },
          { provider: CloudProvider.SCALEWAY, service: universal },
          { provider: CloudProvider.CONTABO, service: universal },
        ]),
      inject: [VolumeExportService],
    },
    {
      provide: PROVIDER_BOOTSTRAP_SEEDER_REGISTRY,
      useFactory: (
        hetzner: HetznerBootstrapSeeder,
        scaleway: ScalewayBootstrapSeeder,
      ): ProviderBootstrapSeederRegistration[] => [
        { provider: CloudProvider.HETZNER, service: hetzner },
        { provider: CloudProvider.SCALEWAY, service: scaleway },
      ],
      inject: [HetznerBootstrapSeeder, ScalewayBootstrapSeeder],
    },
  ],
  exports: [
    ProviderCoreModule,
    CredentialProviderService,
    'ICredentialProvider',
    HetznerProviderModule,
    HetznerObjectStorageModule,
    ContaboProviderModule,
    ScalewayProviderModule,
    ScalewayObjectStorageModule,
    ProviderFactory,
    FirewallProviderFactory,
    DnsProviderFactory,
    CapabilitiesProviderFactory,
    VolumeExportFactory,
    ObjectStorageProvisionerFactory,
    PROVIDER_BOOTSTRAP_SEEDER_REGISTRY,
  ],
})
export class ProvidersModule {}
