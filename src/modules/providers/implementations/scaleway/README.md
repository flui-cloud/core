# Scaleway Provider Analysis

This document captures the analysis completed before implementing the Scaleway
provider for Flui.

## Goal

Flui should expose a single `scaleway` provider while keeping the existing Flui
DTOs and interfaces unchanged. Internally, Scaleway support should handle both:

- Scaleway Instances
- Scaleway Elastic Metal

The distinction should stay inside the provider implementation. The public Flui
API should not require users to choose between two separate providers.

## Recommended Internal Design

Implement one public provider with two internal adapters:

- `ScalewayInstancesAdapter`
- `ScalewayBareMetalAdapter`

Recommended routing rules:

- `listServersAsDto()` merges results from both APIs into a single Flui list
- `getNodeSizes()` merges instance types and bare metal offers
- `createServer()` dispatches by `server_type`
- lifecycle operations dispatch by a typed provider resource identifier

To avoid ambiguous follow-up calls, resource identifiers should keep the source
family and zone, for example:

- `instance:it-mil-1:<server-id>`
- `baremetal:fr-par-1:<server-id>`

This keeps Flui DTOs stable while making later reads, deletes, and power
operations deterministic.

## Official API Sources

The following official OpenAPI specifications are relevant to the integration:

| Scope | Documentation | OpenAPI |
| --- | --- | --- |
| Instances | https://www.scaleway.com/en/developers/api/instances/ | https://www.scaleway.com/en/developers/static/scaleway.instance.v1.Api.yml |
| Elastic Metal | https://www.scaleway.com/en/developers/api/elastic-metal/ | https://www.scaleway.com/en/developers/static/scaleway.baremetal.v1.Api.yml |
| Elastic Metal Flexible IP | https://www.scaleway.com/en/developers/api/elastic-metal-flexible-ip/ | https://www.scaleway.com/en/developers/static/scaleway.flexible_ip.v1alpha1.Api.yml |
| Elastic Metal Private Network | https://www.scaleway.com/en/developers/api/elastic-metal/private-network-api/ | https://www.scaleway.com/en/developers/static/scaleway.baremetal.v3.PrivateNetworkApi.yml |
| Domains and DNS | https://www.scaleway.com/en/developers/api/domains-and-dns/ | https://www.scaleway.com/en/developers/static/scaleway.domain.v2beta1.Api.yml |
| VPC | https://www.scaleway.com/en/developers/api/vpc/ | https://www.scaleway.com/en/developers/static/scaleway.vpc.v2.Api.yml |

## Mapping Flui Capabilities to Scaleway APIs

### Cloud Provider

| Flui concern | Instances API | Elastic Metal API | Notes |
| --- | --- | --- | --- |
| List servers | `GET /instance/v1/zones/{zone}/servers` | `GET /baremetal/v1/zones/{zone}/servers` | Merge into one DTO list |
| Get server details | `GET /servers/{server_id}` | `GET /servers/{server_id}` | Dispatch by typed resource id |
| Create server | `POST /servers` | `POST /servers` + install flow | Mapping differs per family |
| Delete server | `DELETE /servers/{server_id}` | `DELETE /servers/{server_id}` | Same Flui contract |
| Power on/off/reboot | `POST /servers/{server_id}/action` | dedicated start/stop/reboot endpoints | Keep a common abstraction |
| Node sizes | `GET /products/servers` | `GET /offers` | Merge into one catalog |
| Pricing | product pricing | offer pricing | Normalize into Flui pricing DTO |

### Firewall Provider

| Flui concern | Instances | Elastic Metal | Notes |
| --- | --- | --- | --- |
| Managed firewall | Security Groups | partial support only | Elastic Metal public filtering exists, but the model differs |
| Private network filtering | not the same as Flui firewall | host-based | Private traffic should be filtered on the server itself |

Current design implication:

- `IFirewallProvider` can be implemented for Scaleway
- capabilities must be marked as partial where Elastic Metal does not match the
  Instances model

### DNS Provider

| Flui concern | API | Notes |
| --- | --- | --- |
| DNS zones | Domains and DNS API | direct mapping |
| DNS records | Domains and DNS API | direct mapping through record changesets |

### Network Provider

| Flui concern | Instances / VPC | Elastic Metal | Notes |
| --- | --- | --- | --- |
| Private networks | VPC + private NICs | Elastic Metal Private Network API | same business concept, different API shapes |
| Public IPs | Instances IP model | Flexible IP API | do not reuse the instance IP logic |

## Important Mapping Differences

### Labels vs tags

Scaleway uses `tags: string[]`, while Flui uses structured labels. The provider
will need a reversible encoding, for example `key=value` strings.

### Security groups on servers

In the Instances API, a server is associated with a single `security_group`
field, not a list. This differs from providers that allow multiple firewall
attachments.

### SSH keys

Elastic Metal installation naturally accepts SSH keys during OS installation.
Instances do not expose the same create-time model and should rely on cloud-init
or user-data where needed.

### Cloud-init is required

Hetzner provisioning already depends on cloud-init, so Scaleway support should
keep the same behavior.

Relevant findings from the official Scaleway documentation:

- Elastic Metal documentation states that cloud-init became available in October
  2025
- the Elastic Metal concepts page updated on November 3, 2025 documents
  `user-data` support
- the create-server guide updated on August 28, 2025 also mentions cloud-init

Implementation note:

- Elastic Metal product documentation confirms cloud-init support
- the exact OpenAPI field used to submit cloud-init payloads still needs to be
  validated during implementation

## Recommended OpenAPI Generation Layout

To keep the integration maintainable, each Scaleway API family should have its
own downloaded specification and generated client:

- `openapi/instances.yml`
- `openapi/baremetal.yml`
- `openapi/flexible-ip.yml`
- `openapi/private-network.yml`
- `openapi/domain.yml`
- `openapi/vpc.yml`

Generated output:

- `generated/instances/`
- `generated/baremetal/`
- `generated/flexible-ip/`
- `generated/private-network/`
- `generated/domain/`
- `generated/vpc/`

This avoids mixing unrelated models in one generated package and matches the
fact that Scaleway publishes separate specifications.

## Code Generation Note

The download script stores the official Scaleway specifications locally, but it
also removes the `x-enum-descriptions` vendor extension during download.

Reason:

- Scaleway publishes several OpenAPI 3.1 specs with that extension
- `openapi-generator-cli` 7.12.0 with `typescript-axios` crashes on at least the
  Instances spec while processing those enum metadata blocks
- removing that extension does not change request or response shapes, it only
  drops generator-facing enum descriptions

Use a single entrypoint from the repository root:

`npm run generate:scaleway-client`

## Initial Implementation Scope

Recommended order:

1. Generate clients for all relevant Scaleway APIs
2. Implement the shared `scaleway` provider facade
3. Start with read-only inventory and server lifecycle
4. Add DNS support
5. Add firewall support with explicit capability limits
6. Add network support after the compute mapping is stable

## Open Questions

- Which Elastic Metal API field should carry cloud-init payloads in the real
  install flow?
- How much of the Elastic Metal public firewall model is exposed through the API
  in a way that fits `IFirewallProvider`?
- Should Flui require project/organization metadata in addition to the API token
  for full DNS and network coverage?
