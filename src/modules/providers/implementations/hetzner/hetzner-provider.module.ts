import { Module } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { DnsProvider } from '../../enums/dns-provider.enum';
import { HetznerProviderService } from '../../services/hetzner-provider.service';
import { HetznerFirewallService } from '../../services/hetzner-firewall.service';
import { HetznerDnsService } from '../../services/hetzner-dns.service';
import { HetznerCapabilitiesService } from './hetzner-capabilities.service';
import { HetznerBootstrapSeeder } from './hetzner-bootstrap-seeder.service';
import { SharedInfrastructureModule } from '../../../infrastructure/shared/shared-infrastructure.module';
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

@Module({
  imports: [SharedInfrastructureModule],
  providers: [
    HetznerProviderService,
    HetznerFirewallService,
    HetznerDnsService,
    HetznerCapabilitiesService,
    HetznerBootstrapSeeder,

    multiProvider<CapabilitiesProviderRegistration>({
      provide: CAPABILITIES_PROVIDER_REGISTRY,
      useFactory: (
        s: HetznerCapabilitiesService,
      ): CapabilitiesProviderRegistration => ({
        provider: CloudProvider.HETZNER,
        service: s,
      }),
      inject: [HetznerCapabilitiesService],
      multi: true,
    }),

    multiProvider<CloudProviderRegistration>({
      provide: CLOUD_PROVIDER_REGISTRY,
      useFactory: (s: HetznerProviderService): CloudProviderRegistration => ({
        provider: CloudProvider.HETZNER,
        service: s,
      }),
      inject: [HetznerProviderService],
      multi: true,
    }),

    multiProvider<FirewallProviderRegistration>({
      provide: FIREWALL_PROVIDER_REGISTRY,
      useFactory: (
        s: HetznerFirewallService,
      ): FirewallProviderRegistration => ({
        provider: CloudProvider.HETZNER,
        service: s,
      }),
      inject: [HetznerFirewallService],
      multi: true,
    }),

    multiProvider<DnsProviderRegistration>({
      provide: DNS_PROVIDER_REGISTRY,
      useFactory: (s: HetznerDnsService): DnsProviderRegistration => ({
        provider: DnsProvider.HETZNER,
        service: s,
      }),
      inject: [HetznerDnsService],
      multi: true,
    }),
  ],
  exports: [
    HetznerProviderService,
    HetznerFirewallService,
    HetznerDnsService,
    HetznerCapabilitiesService,
    HetznerBootstrapSeeder,
    CLOUD_PROVIDER_REGISTRY,
    FIREWALL_PROVIDER_REGISTRY,
    DNS_PROVIDER_REGISTRY,
    CAPABILITIES_PROVIDER_REGISTRY,
  ],
})
export class HetznerProviderModule {}
