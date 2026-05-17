import { FactoryProvider, Provider } from '@nestjs/common';
import { CloudProvider } from '../enums/cloud-provider.enum';
import { DnsProvider } from '../enums/dns-provider.enum';
import { CertificateProvider } from '../enums/certificate-provider.enum';
import { ICloudProvider } from './interfaces/cloud-provider.interface';
import { IFirewallProvider } from './interfaces/firewall-provider.interface';
import { IDnsProvider } from './interfaces/dns-provider.interface';
import { ICertificateProvider } from './interfaces/certificate-provider.interface';
import { IProviderBootstrapSeeder } from './interfaces/provider-bootstrap-seeder.interface';
import { IProviderCapabilitiesService } from '../interfaces/provider-capabilities.interface';
import { IVolumeExport } from '../interfaces/volume-export.interface';

/**
 * NestJS multi-token provider type.
 * `multi: true` is a runtime feature not declared in the NestJS TypeScript types.
 */
export type MultiProvider<T = unknown> = FactoryProvider<T> & { multi: true };

/**
 * Type-safe helper for declaring a multi-token provider.
 * Verifies the shape of the provider at compile time, then casts to Provider
 * so it can be used directly in the `providers` array of a @Module decorator.
 */
export function multiProvider<T>(p: MultiProvider<T>): Provider {
  return p as unknown as Provider;
}

export const CLOUD_PROVIDER_REGISTRY = 'CLOUD_PROVIDER_REGISTRY';
export const FIREWALL_PROVIDER_REGISTRY = 'FIREWALL_PROVIDER_REGISTRY';
export const DNS_PROVIDER_REGISTRY = 'DNS_PROVIDER_REGISTRY';
export const CERTIFICATE_PROVIDER_REGISTRY = 'CERTIFICATE_PROVIDER_REGISTRY';
export const CAPABILITIES_PROVIDER_REGISTRY = 'CAPABILITIES_PROVIDER_REGISTRY';
export const VOLUME_EXPORT_REGISTRY = 'VOLUME_EXPORT_REGISTRY';
export const PROVIDER_BOOTSTRAP_SEEDER_REGISTRY =
  'PROVIDER_BOOTSTRAP_SEEDER_REGISTRY';

export interface CloudProviderRegistration {
  provider: CloudProvider;
  service: ICloudProvider;
}

export interface FirewallProviderRegistration {
  provider: CloudProvider;
  service: IFirewallProvider;
}

export interface DnsProviderRegistration {
  provider: DnsProvider;
  service: IDnsProvider;
}

export interface CertificateProviderRegistration {
  provider: CertificateProvider;
  service: ICertificateProvider;
}

export interface CapabilitiesProviderRegistration {
  provider: CloudProvider;
  service: IProviderCapabilitiesService;
}

export interface VolumeExportRegistration {
  provider: CloudProvider;
  service: IVolumeExport;
}

export interface ProviderBootstrapSeederRegistration {
  provider: CloudProvider;
  service: IProviderBootstrapSeeder;
}
