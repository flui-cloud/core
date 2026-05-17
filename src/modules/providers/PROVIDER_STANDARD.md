# Cloud Provider Standard for Flui

This document defines the capabilities a cloud provider should offer to be a first-class
citizen in Flui. It is written without reference to any specific implementation detail —
its purpose is to establish a shared standard that Flui contributors and evaluators can use
to assess, compare, and prioritize provider integrations.

---

## Guiding principles

**Programmability over console.** Every capability described here must be accessible via
an API. A feature available only through a web UI is, from Flui's perspective, a
missing feature.

**Pay for what you use.** Infrastructure provisioned by Flui is often ephemeral.
Pricing models that penalize short-lived resources (minimum commitments, reservation
requirements, early termination fees) are incompatible with elastic workloads.

**Predictable abstractions.** Flui manages resources on behalf of users. Providers
should expose stable, deterministic APIs: create returns an ID, delete terminates billing,
status is always queryable. Side effects and implicit state transitions are failure modes.

**Security by default.** Access control, key management, and network isolation should be
first-class API features — not afterthoughts configurable only post-creation.

---

## Capability areas

### 1. Compute

The foundation. A provider that cannot offer programmable, on-demand compute cannot be
integrated into Flui at all.

**Must have:**
- Create a virtual machine (or bare metal server) via API with: machine type, OS image,
  SSH access configuration, startup script, and resource tags
- Delete a server via API with immediate effect
- Query the current status of a server (running, stopped, error, etc.)
- List all servers associated with an account, filterable by tags
- Attach arbitrary key/value metadata (labels or tags) to servers at creation and update
  them afterwards — this is the primary mechanism for resource ownership and discovery

**Should have:**
- Power on / power off a server without deleting it
- Reboot a server
- Resize a server (change machine type) without re-provisioning
- Console/serial access for emergency recovery

**Nice to have:**
- Server snapshots and restore
- Scheduled maintenance windows
- Detailed audit log of all compute operations

---

### 2. Billing model

The billing model determines whether a provider can support the elastic, autoscaling
workloads that Flui is designed for.

**Must have:**
- Hourly (or per-minute) billing for compute resources — no minimum usage period
- Billing terminates immediately when a server is deleted
- Transparent pricing accessible via API (list of machine types with their hourly cost)

**Should have:**
- Price difference between regions exposed via API
- Spot/preemptible instances for cost-optimized batch workloads (separate tier)
- Usage and cost reporting API

**Disqualifying conditions** (provider cannot support Flui autoscale):
- Monthly-only billing with no hourly option
- Minimum commitment period before deletion is allowed
- Deletion fee or early termination charge

---

### 3. SSH key management

SSH access is the primary mechanism for initial node bootstrapping in Flui. A provider-level
key registry allows keys to be managed centrally and attached to nodes declaratively at
creation time — eliminating the need to embed keys in startup scripts.

**Must have:**
- Register an SSH public key on the account with a name and optional tags
- Delete a registered key
- List all registered keys
- Reference a registered key by ID when creating a server (so the key is pre-authorized
  at first boot, before any startup script runs)

**Should have:**
- Key fingerprint returned on registration (for verification)
- Tags/labels on keys for ownership tracking
- Immutable key content (updates require delete + recreate)

---

### 4. Network firewall

Flui nodes should not be reachable on arbitrary ports from the internet. A provider
firewall API allows Flui to define and enforce network policies declaratively,
without relying on OS-level firewalls that may not be present in the base image.

**Must have:**
- Create a firewall with a set of inbound and outbound rules (protocol, port range,
  source/destination CIDR)
- Attach a firewall to one or more servers (at creation time and afterwards)
- Detach a firewall from servers
- Update firewall rules without recreating the firewall
- Delete a firewall
- List firewalls, filterable by tags

**Should have:**
- Stateful firewall (return traffic automatically allowed)
- Default-deny inbound policy (only explicitly allowed traffic passes)
- Tags/labels on firewalls for ownership tracking

---

### 5. DNS management

Flui cluster endpoints, ingress controllers, and internal services require DNS records.
A provider DNS API allows Flui to create and tear down records programmatically
as infrastructure is provisioned and decommissioned.

**Must have:**
- List DNS zones associated with the account
- Create a DNS record (A, AAAA, CNAME, TXT, MX) in a zone
- Update an existing record
- Delete a record by ID
- List records in a zone, filterable by type and name

**Should have:**
- TTL control per record
- Bulk record operations (create multiple records in a single API call)
- DNSSEC support
- Low propagation time (< 60 seconds for changes to take effect globally)

---

### 6. Private networking (VNet / VPC)

Internal Flui cluster traffic (node-to-node, pod-to-pod) should travel over a private
network rather than the public internet. Private networks reduce latency, eliminate egress
costs for intra-cluster traffic, and improve security posture.

**Must have:**
- Create a private network with a defined IP range (RFC 1918, at least /24)
- Delete a private network
- Attach a server to a private network (server receives a stable private IP on that network)
- Detach a server from a private network
- List private networks, filterable by tags

**Should have:**
- Multiple subnets within a network
- Static private IP assignment at attach time
- Cross-zone private networking (nodes in different availability zones on the same network)
- Network peering between accounts or projects

**Nice to have:**
- Managed NAT gateway (for outbound internet access from private-only nodes)
- Flow logs for network traffic analysis

---

### 7. Power management

The ability to stop and restart servers without destroying them is required for maintenance
operations, cost optimization (stop idle dev clusters overnight), and recovery workflows
within Flui.

**Must have:**
- Power off a running server gracefully (OS shutdown) via API
- Power on a stopped server via API
- Query current power state as part of server status

**Should have:**
- Hard reset (force power cycle) for unresponsive servers
- Scheduled power operations
- Billing suspension for stopped servers (provider does not charge compute for stopped
  servers — storage billing may continue)

---

### 8. OS images

Flui provisions nodes using a defined OS image. Providers must offer images that
are compatible with Flui's provisioning model.

**Must have:**
- Ubuntu 24.04 LTS available as a first-party image
- x86_64 (amd64) architecture
- cloud-init (or compatible) support for startup script execution
- SSH server running and accessible after first boot
- Kernel version ≥ 5.15 (required for modern container runtimes and eBPF)

**Should have:**
- Image freshness: base images updated monthly with security patches
- Immutable image IDs (an image ID always refers to the same image version)
- Custom image upload (for pre-baked images)

**Not required (current scope):**
- ARM / Apple Silicon support
- Windows images
- GPU-enabled images

---

### 9. Authentication and access control

**Must have:**
- API token authentication (static token sent as HTTP header)
- Token scoped to an account or project
- Token revocable without affecting other tokens

**Should have:**
- Multiple tokens per account with independent revocation
- Token labels/descriptions for audit purposes
- IP allowlist per token

**Nice to have:**
- Short-lived tokens (automatic expiry)
- Read-only tokens (for monitoring integrations)
- Service accounts with fine-grained permission scopes

---

### 10. API quality

**Must have:**
- REST or gRPC API with stable, versioned endpoints
- Standard HTTP status codes (4xx for client errors, 5xx for server errors)
- Consistent error format with a machine-readable error code and human-readable message
- OpenAPI (Swagger) specification published and kept in sync with the implementation
- Rate limiting headers (so clients can back off gracefully)

**Should have:**
- Idempotent creation endpoints (re-submitting the same request does not create duplicates)
- Pagination for list endpoints with consistent cursor/page semantics
- Filtering and sorting on list endpoints
- Request IDs in responses for traceability

**Nice to have:**
- Webhooks or event streaming for async state changes (instead of polling)
- Client libraries in major languages (TypeScript, Python, Go)
- Sandbox / test environment

---

## Evaluation summary

When evaluating a new provider for Flui, score each area:

| Area | Weight | Rationale |
|------|--------|-----------|
| Compute | ★★★★★ | Core — without it nothing works |
| Billing model | ★★★★★ | Determines autoscale viability |
| SSH key management | ★★★★☆ | Required for clean bootstrapping |
| Network firewall | ★★★★☆ | Required for production security |
| DNS management | ★★★☆☆ | Improves UX; workaround exists |
| Private networking | ★★★☆☆ | Improves performance; workaround exists |
| Power management | ★★☆☆☆ | Useful for ops; not blocking |
| OS images | ★★★★★ | Ubuntu 24.04 x86 is non-negotiable |
| Auth & access control | ★★★★☆ | Static token is the minimum |
| API quality | ★★★☆☆ | Poor APIs increase integration cost |

A provider that scores full marks on Compute, Billing, OS images, and API quality is
ready for integration into Flui. All other areas improve the depth of integration but are not
blockers.
