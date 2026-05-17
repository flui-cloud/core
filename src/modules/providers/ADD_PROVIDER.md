# Adding a New Cloud Provider

The architecture uses a registry pattern with NestJS `multi: true` tokens:
each provider module is self-contained and auto-registers itself.
There is **one** file outside the provider module that always needs updating:
`ProviderCapabilitiesFactory` (see Step 6).

---

## Overview of what you'll touch

| Step | File(s)                                                            | What changes                       |
|------|--------------------------------------------------------------------|------------------------------------|
| 1    | `enums/cloud-provider.enum.ts`                                     | Add enum value                     |
| 2    | `enums/dns-provider.enum.ts`                                       | Add enum value (if DNS supported)  |
| 3    | `implementations/<provider>/<provider>-provider.service.ts`        | Implement `ICloudProvider`         |
| 4    | `implementations/<provider>/<provider>-firewall.service.ts`        | Implement `IFirewallProvider` (optional) |
| 5    | `implementations/<provider>/<provider>-dns.service.ts`             | Implement `IDnsProvider` (optional) |
| 6    | `implementations/<provider>/<provider>-provider.module.ts`         | Self-contained NestJS module       |
| 7    | `providers.module.ts`                                              | 1 line: add import                 |
| 8    | `cli/src/cli-providers.module.ts`                                  | 1 line: add import                 |
| 9    | `management/services/capabilities/<provider>-capabilities.service.ts` | **Outside provider module** — required |
| 10   | `management/services/capabilities/provider-capabilities.factory.ts`   | **Outside provider module** — required |

---

## Step 1 — Add enum values

**`src/modules/providers/enums/cloud-provider.enum.ts`**
```typescript
export enum CloudProvider {
  CONTABO = 'contabo',
  HETZNER = 'hetzner',
  SCALEWAY = 'scaleway',  // ← add
}
```

If the provider also supports DNS, add it to the DNS enum:

**`src/modules/providers/enums/dns-provider.enum.ts`**
```typescript
export enum DnsProvider {
  HETZNER = 'hetzner',
  SCALEWAY = 'scaleway',  // ← add
  NONE = 'none',
}
```

---

## Step 2 — Implement the services

Create your services in `src/modules/providers/implementations/scaleway/`.

### `scaleway-provider.service.ts` — required

Must implement `ICloudProvider` (see [interfaces/cloud-provider.interface.ts](interfaces/cloud-provider.interface.ts)).

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ICloudProvider } from '../../interfaces/cloud-provider.interface';
import { ICredentialProvider } from '../../interfaces/credential-provider.interface';
import { LabelService } from '../../../common/services/label.service';

@Injectable()
export class ScalewayProviderService implements ICloudProvider {
  constructor(
    @Inject('ICredentialProvider')
    private readonly credentialProvider: ICredentialProvider,
    private readonly labelService: LabelService,
  ) {}

  // implement all required methods from ICloudProvider...
}
```

Key points:
- Inject credentials via `@Inject('ICredentialProvider')` — never hardcode API keys.
  `credentialProvider.getActiveApiToken(CloudProvider.SCALEWAY)` returns the stored token.
- `LabelService` and `NodeSizeMapper`/`PricingMapper` are globally available (from `ProviderCoreModule`)
  — inject them directly without any module import.
- `ICredentialProvider` is globally available (from `ProvidersModule` / `CliProvidersModule`)
  — inject it directly without any module import.
- Create HTTP/SDK clients lazily (per-method or as private lazy helpers), not in the constructor.

**Required methods** (must not throw `NotImplementedException`):
`listServersAsDto`, `getServerDetailsAsDto`, `createServer`, `deleteServer`, `getServerStatus`, `testConnection`

**Optional methods** (implement what you support, leave others out):
`powerOnServer`, `powerOffServer`, `updateServerLabels`, `listSSHKeys`, `createSSHKey`, `deleteSSHKey`,
`getSSHKey`, `getNodeSizes`, `getPricing`, VNet methods (`createVNet`, etc.)

### `scaleway-firewall.service.ts` — optional

Implement `IFirewallProvider` (see [interfaces/firewall-provider.interface.ts](interfaces/firewall-provider.interface.ts)):
`createFirewall`, `getFirewall`, `listFirewalls`, `updateFirewallRules`, `deleteFirewall`, `applyToServers`, `removeFromServers`

### `scaleway-dns.service.ts` — optional

Implement `IDnsProvider` (see [interfaces/dns-provider.interface.ts](interfaces/dns-provider.interface.ts)):
zone methods (`listZones`, `getZone`, `getZoneByName`) + record methods (`listRecords`, `getRecord`,
`createRecord`, `updateRecord`, `deleteRecord`, `bulkCreateRecords`)

---

## Step 3 — Create the provider module

**`src/modules/providers/implementations/scaleway/scaleway-provider.module.ts`**

This module is fully self-contained. It declares its own services and registers them
into the global registries via `multi: true` tokens. Zero imports required.

```typescript
import { Module } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { DnsProvider } from '../../enums/dns-provider.enum';
import { ScalewayProviderService } from './scaleway-provider.service';
import { ScalewayFirewallService } from './scaleway-firewall.service';
import { ScalewayDnsService } from './scaleway-dns.service';
import {
  CLOUD_PROVIDER_REGISTRY,
  FIREWALL_PROVIDER_REGISTRY,
  DNS_PROVIDER_REGISTRY,
  CloudProviderRegistration,
  FirewallProviderRegistration,
  DnsProviderRegistration,
  multiProvider,
} from '../../core/tokens';

@Module({
  providers: [
    ScalewayProviderService,
    ScalewayFirewallService,
    ScalewayDnsService,

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
      useFactory: (s: ScalewayFirewallService): FirewallProviderRegistration => ({
        provider: CloudProvider.SCALEWAY,
        service: s,
      }),
      inject: [ScalewayFirewallService],
      multi: true,
    }),

    // Only include if DNS is supported
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
    CLOUD_PROVIDER_REGISTRY,
    FIREWALL_PROVIDER_REGISTRY,
    DNS_PROVIDER_REGISTRY,
  ],
})
export class ScalewayProviderModule {}
```

---

## Step 4 — Add 1 import to `providers.module.ts`

**`src/modules/providers/providers.module.ts`**

```typescript
import { ScalewayProviderModule } from './implementations/scaleway/scaleway-provider.module';

@Global()
@Module({
  imports: [
    // ... existing imports ...
    HetznerProviderModule,
    ContaboProviderModule,
    ScalewayProviderModule,  // ← add
  ],
  // ...
  exports: [
    // ... existing exports ...
    HetznerProviderModule,
    ContaboProviderModule,
    ScalewayProviderModule,  // ← add
  ],
})
export class ProvidersModule {}
```

---

## Step 5 — Add 1 import to `cli-providers.module.ts`

**`cli/src/cli-providers.module.ts`**

Identical change — same import, same entry in `imports` and `exports`.

---

## Step 6 — Create `<Provider>CapabilitiesService` (required, outside provider module)

**`src/modules/management/services/capabilities/<provider>-capabilities.service.ts`**

This is the **only file outside the provider module** that must be created.
It provides static/live data for the management UI: regions, instance types, provider info.

```typescript
import { Injectable, Inject, Logger } from '@nestjs/common';
import { IProviderCapabilitiesService, InstanceTypeInfo, ProviderInfo } from '../../interfaces/provider-capabilities.interface';
import { ProviderRegion } from '../../entities/provider-region.entity';
import { ProviderCapabilities } from '../../entities/provider-capabilities.entity';
import { CloudProvider } from '../../../providers/enums/cloud-provider.enum';
import { ICredentialProvider } from '../../../providers/interfaces/credential-provider.interface';

@Injectable()
export class MyProviderCapabilitiesService implements IProviderCapabilitiesService {
  private readonly logger = new Logger(MyProviderCapabilitiesService.name);

  constructor(
    @Inject('ICredentialProvider')
    private readonly credentialProvider: ICredentialProvider,
  ) {}

  async getAvailableRegions(): Promise<ProviderRegion[]> {
    // Static or fetched from provider API with fallback
    return [
      { id: 'region-1', name: 'City', displayName: 'City, Country', location: 'Country', available: true, country: 'Country' },
    ];
  }

  async getSupportedInstanceTypes(): Promise<InstanceTypeInfo[]> {
    // Fetch from provider API; fallback to static mock on error
    return [];
  }

  async getProviderInfo(): Promise<ProviderInfo> {
    return {
      id: CloudProvider.MY_PROVIDER,
      name: 'my_provider',
      displayName: 'My Provider',
      description: '...',
      logoUrl: '/logos/my-provider.png',
      websiteUrl: 'https://...',
      documentationUrl: 'https://...',
      accessKeyDocumentationUrl: 'https://...',
      pricingUrl: 'https://...',
      supportUrl: 'https://...',
    };
  }

  async getCapabilities(): Promise<ProviderCapabilities> {
    const [regions, instanceTypes] = await Promise.all([
      this.getAvailableRegions(),
      this.getSupportedInstanceTypes(),
    ]);
    return {
      supportedInstanceTypes: instanceTypes.map(t => t.id),
      supportedRegions: regions,
      credentialType: 'api_key',
      features: { autoScaling: false, loadBalancers: false, privateNetworking: false, snapshots: false, backups: false },
      pricing: { currency: 'EUR', billingCycle: 'hourly', minimumCost: 0 },
    };
  }
}
```

Then update **`provider-capabilities.factory.ts`** — the only existing file that needs editing:
```typescript
// 1. Import
import { MyProviderCapabilitiesService } from './my-provider-capabilities.service';

// 2. Add to constructor
private readonly myProviderCapabilities: MyProviderCapabilitiesService,

// 3. Add to switch
case CloudProvider.MY_PROVIDER: return this.myProviderCapabilities;

// 4. Add to getSupportedProviders()
return [...existing, CloudProvider.MY_PROVIDER];
```

Finally, add `MyProviderCapabilitiesService` to `providers[]` in **`management.module.ts`**.

---

## Step 7 — SSHProviderFactory (only if provider needs a dedicated ISSHProvider)

**`src/modules/access/providers/<provider>-ssh-provider.service.ts`**

Most providers implement `ICloudProvider.createSSHKey` directly — no separate `ISSHProvider` needed.
The `SSHProviderFactory.getAvailableProviders()` is already dynamic (delegates to `ProviderFactory`).

Only create an `ISSHProvider` if the provider has SSH-specific logic not covered by `ICloudProvider`
(see `HetznerSSHProviderService` / `ContaboSSHProviderService` for examples).
If you don't create one, `SSHProviderFactory.getProvider(MY_PROVIDER)` returns `null` by default — correct behavior.

---

## How the registry works

```
ScalewayProviderModule
  └─ multi:true provider → CLOUD_PROVIDER_REGISTRY: { provider: SCALEWAY, service: ScalewayProviderService }

HetznerProviderModule
  └─ multi:true provider → CLOUD_PROVIDER_REGISTRY: { provider: HETZNER, service: HetznerProviderService }

ProvidersModule imports both
  └─ NestJS aggregates multi:true tokens into an array
       ↓ injected into
  └─ ProviderFactory constructor: CloudProviderRegistration[]
       └─ Map<CloudProvider, ICloudProvider>
            ↓ used by consumers
  └─ providerFactory.getProvider(CloudProvider.SCALEWAY) → ScalewayProviderService
```

The same pattern applies for `FirewallProviderFactory` / `FIREWALL_PROVIDER_REGISTRY`
and `DnsProviderFactory` / `DNS_PROVIDER_REGISTRY`.

Consumer modules call:
```typescript
const provider = this.providerFactory.getProvider(CloudProvider.SCALEWAY);
const firewall = this.firewallFactory.getFirewallProviderOrFail(CloudProvider.SCALEWAY);
const dns = this.dnsFactory.getDnsProvider(DnsProvider.SCALEWAY); // returns null if not registered
```

---

## Checklist

**Inside the provider module (self-contained):**
- [ ] `CloudProvider.<PROVIDER>` added to `enums/cloud-provider.enum.ts`
- [ ] `DnsProvider.<PROVIDER>` added to `enums/dns-provider.enum.ts` (if DNS supported)
- [ ] `<Provider>ProviderService` implements `ICloudProvider` (required methods + optional SSH/VNet)
- [ ] `<Provider>FirewallService` implements `IFirewallProvider` (optional)
- [ ] `<Provider>DnsService` implements `IDnsProvider` (optional)
- [ ] VNet adapter + methods on ProviderService (optional)
- [ ] `<Provider>ProviderModule` with `multi: true` providers + exports
- [ ] `<Provider>ProviderModule` added to `providers.module.ts` imports + exports
- [ ] Same 1-line change in `cli/src/cli-providers.module.ts`

**Outside the provider module (always required):**
- [ ] `<Provider>CapabilitiesService` created in `management/services/capabilities/`
- [ ] `ProviderCapabilitiesFactory`: import + constructor + switch + `getSupportedProviders()` updated
- [ ] `ManagementModule.providers[]`: `<Provider>CapabilitiesService` added

**Verify:**
- [ ] `pnpm run build` passes (no TypeScript errors)
- [ ] `pnpm run start:dev` — no DI errors at startup
- [ ] See `CAPABILITIES.md` for the capability levels your provider supports
