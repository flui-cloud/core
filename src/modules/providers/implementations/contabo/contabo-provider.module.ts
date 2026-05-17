import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { ContaboProviderService } from '../../services/contabo-provider.service';
import { ContaboFirewallService } from '../../services/contabo-firewall.service';
import { ContaboCapabilitiesService } from './contabo-capabilities.service';
import {
  CLOUD_PROVIDER_REGISTRY,
  FIREWALL_PROVIDER_REGISTRY,
  CAPABILITIES_PROVIDER_REGISTRY,
  CloudProviderRegistration,
  FirewallProviderRegistration,
  CapabilitiesProviderRegistration,
  multiProvider,
} from '../../core/tokens';

/**
 * Contabo provider module — auto-registers all Contabo services into the global registry.
 *
 * Services depend on 'ICredentialProvider' which must be provided globally
 * by the parent module (ProvidersModule / CliProvidersModule marked @Global()).
 *
 * To add Contabo to the system: import ContaboProviderModule in ProvidersModule.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    ContaboProviderService,
    ContaboFirewallService,
    ContaboCapabilitiesService,

    multiProvider<CapabilitiesProviderRegistration>({
      provide: CAPABILITIES_PROVIDER_REGISTRY,
      useFactory: (
        s: ContaboCapabilitiesService,
      ): CapabilitiesProviderRegistration => ({
        provider: CloudProvider.CONTABO,
        service: s,
      }),
      inject: [ContaboCapabilitiesService],
      multi: true,
    }),

    multiProvider<CloudProviderRegistration>({
      provide: CLOUD_PROVIDER_REGISTRY,
      useFactory: (s: ContaboProviderService): CloudProviderRegistration => ({
        provider: CloudProvider.CONTABO,
        service: s,
      }),
      inject: [ContaboProviderService],
      multi: true,
    }),

    multiProvider<FirewallProviderRegistration>({
      provide: FIREWALL_PROVIDER_REGISTRY,
      useFactory: (
        s: ContaboFirewallService,
      ): FirewallProviderRegistration => ({
        provider: CloudProvider.CONTABO,
        service: s,
      }),
      inject: [ContaboFirewallService],
      multi: true,
    }),
  ],
  exports: [
    ContaboProviderService,
    ContaboFirewallService,
    ContaboCapabilitiesService,
    CLOUD_PROVIDER_REGISTRY,
    FIREWALL_PROVIDER_REGISTRY,
    CAPABILITIES_PROVIDER_REGISTRY,
  ],
})
export class ContaboProviderModule {}
