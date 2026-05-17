# Flui CLI — Architecture

This document describes how the Flui CLI is built, how a command is executed
end-to-end, and how the CLI relates to the Flui Cloud backend (`flui.api`).

> **Audience:** maintainers and contributors. Day-to-day usage of individual
> commands is documented inline (`flui <command> --help`) and in user-facing
> guides under [`cli/docs/`](.).

## What the CLI is

The Flui CLI (`flui`) is a **local control-plane tool** that provisions
infrastructure on cloud providers and orchestrates Flui Cloud applications
running on user-owned Kubernetes clusters. It runs entirely on the operator's
machine, with no required server-side component for bootstrap operations.

Two design properties shape every part of the CLI:

1. **Self-contained bootstrap** — the CLI must be able to provision the very
   first cluster (which will eventually host `flui.api` itself), so it cannot
   depend on the backend being already deployed. It must talk to cloud
   provider APIs directly.
2. **Headless NestJS** — the CLI is a NestJS application without an HTTP
   server. It reuses the same `@Injectable()` provider services that the
   backend uses, but with file-based persistence in `~/.flui/` instead of
   PostgreSQL and Redis.

Together these two properties yield an architecture in which the CLI looks
like "the backend, minus the database, minus the queue, minus the HTTP
server" — and can therefore share substantial code with `flui.api`.

## Technology stack

| Layer                      | Choice                                                                     | Rationale                                                   |
| -------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Language                   | TypeScript (strict-ish, see [`cli/tsconfig.json`](../tsconfig.json))       | Same toolchain as the backend                               |
| CLI framework              | [oclif](https://oclif.io)                                                  | Topic/command structure, auto-generated help, plugin system |
| DI / module system         | NestJS (`@nestjs/core`, `@nestjs/common`)                                  | Reuse backend modules verbatim                              |
| Persistence                | JSON files under `~/.flui/profiles/<name>/`                                | No external services required                               |
| HTTP client (post-cluster) | `axios` wrapped in [`ApiClient`](../src/lib/api-client.ts)                 | Same client across all commands                             |
| Secret encryption          | AES-256-GCM via [`encryption.module`](../../src/modules/shared/encryption) | Reused from backend                                         |
| Output                     | `chalk` + `ora` (spinners)                                                 | Conventional CLI UX                                         |

NestJS is bootstrapped _without_ the HTTP layer
([`getNestApp`](../src/lib/nest-app.ts) calls `NestFactory.create` but never
`listen`). TypeORM and Bull are not loaded at all — the CLI uses
[`typeorm-shim.ts`](../src/lib/typeorm-shim.ts) to satisfy the
`getRepositoryToken()` API that some shared modules expect, without
actually pulling TypeORM into the dependency tree.

## Repository layout

```
cli/
├── bin/run                       # oclif entry point (#!/usr/bin/env node)
├── package.json                  # name: @flui-cloud/cli, bin: { flui }
├── tsconfig.json                 # has paths alias src/* → ../src/*
├── src/
│   ├── cli.module.ts             # root NestJS module
│   ├── cli-providers.module.ts   # provider services + factories
│   ├── modules/
│   │   └── cli-infrastructure.module.ts  # cluster/node/firewall/operation services
│   ├── commands/                 # oclif commands, one file per leaf command
│   │   ├── auth/                 # login, logout, whoami
│   │   ├── env/                  # create, destroy, status, update-firewall, ...
│   │   ├── cluster/              # ls, get, scale
│   │   ├── app/                  # deploy, ls, logs, ...
│   │   ├── catalog/              # install, ls, ...
│   │   ├── config/               # get, set, show, ...
│   │   ├── context/              # use, current, ls (profile switching)
│   │   ├── dev/                  # developer-facing helpers
│   │   ├── dns/, node/, server-types/, template/
│   │   ├── deploy.ts             # top-level shortcuts
│   │   ├── ssh.ts
│   │   ├── reconcile.ts
│   │   └── update.ts
│   ├── services/                 # CLI-only services (file-based, env detection, etc.)
│   ├── lib/                      # utilities, repositories, helpers
│   │   ├── nest-app.ts           # NestFactory bootstrap singleton
│   │   ├── profile-manager.ts    # ~/.flui/profiles/<name>/ management
│   │   ├── api-client.ts         # axios wrapper for flui.api
│   │   ├── repositories/         # CliClusterRepository, CliNodeRepository, ...
│   │   ├── templates/            # static infrastructure templates (firewall rules, ...)
│   │   ├── utils/                # ip-detection, formatting helpers
│   │   └── typeorm-shim.ts       # token generation without TypeORM dep
│   ├── hooks/                    # oclif hooks (command_not_found, ...)
│   ├── background/               # long-running watchers
│   ├── config/                   # CLI default values
│   └── types/                    # shared TS types
├── docs/                         # this file, CONFIGURATION.md, ...
└── lib/                          # tsc + tsc-alias build output (gitignored at root)
```

The `cli/` directory ships its own `node_modules`, `package.json` and build
output (`lib/`). It is published to npm as `@flui-cloud/cli` independently
of the backend.

## How a command runs

Below is the lifecycle of a typical command from invocation to exit.
Steps marked **(lazy)** only happen when needed.

```
$ flui env status
   │
   1. node + bin/run loads oclif
   │    │
   │    └─ oclif resolves the command class from
   │       lib/cli/src/commands/env/status.ts (post-build path)
   │
   2. Command.run() is invoked by oclif
   │
   3. await getNestApp()                     ← (lazy) NestJS bootstrap
   │    │
   │    ├─ ProfileManager.migrateIfNeeded()   ← upgrades legacy ~/.flui layout
   │    ├─ ConfigModule.forRoot reads
   │    │     ~/.flui/profiles/<active>/.env  and  ./.env
   │    ├─ NestFactory.create(CliModule)
   │    │     - imports CliProvidersModule (Hetzner, Contabo, factories)
   │    │     - imports CliInfrastructureModule (file-based repos)
   │    │     - imports CommonModule (LabelService etc.)
   │    │     - imports EncryptionModule
   │    └─ returns the singleton INestApplication
   │
   4. Command resolves dependencies via app.get(Service)
   │    │  - app.get(CliClustersService)
   │    │  - app.get(HetznerFirewallService)   ← shared from flui.api
   │    │  - app.get(ApiClient)                ← for backend HTTP calls
   │    └─ ...
   │
   5. Command performs business logic
   │    - reads/writes ~/.flui/profiles/<name>/*.json via Cli*Repository
   │    - calls cloud provider APIs directly (bootstrap mode)
   │    - or calls flui.api over HTTPS via ApiClient (runtime mode)
   │
   6. Output to stdout (chalk + ora)
   │
   7. await closeNestApp()
        - app.close() shuts down DI container
        - process exits (any leftover ioredis/typeorm timers are intentionally
          ignored — none are loaded in CLI mode)
```

## Two access modes, by intent

The CLI deliberately mixes two ways of talking to the world.

### Mode 1 — Direct provider access (bootstrap and rescue)

Used when there is no `flui.api` instance to delegate to, or when calling the
backend would be circular. Concretely: cluster creation, firewall provisioning,
SSH key management, server-type listing, anything that happens **before** the
first observability cluster is up and the API is reachable.

The CLI imports the same NestJS provider services that `flui.api` would use:

```ts
// cli/src/commands/env/update-firewall.ts
const firewallService = app.get(HetznerFirewallService);
await firewallService.createFirewall({ ... });
```

The credentials feeding these services come from
[`CliCredentialProviderService`](../src/lib/cli-credential-provider.service.ts),
a file-backed implementation of `ICredentialProvider` that reads from the
local token vault (`~/.flui/profiles/<name>/.key`, AES-256-GCM-encrypted)
instead of the database that the backend's `CredentialProviderService` uses.

### Mode 2 — HTTP API (post-bootstrap operations)

Once `flui.api` is deployed on a cluster and the user has run `flui auth
login`, runtime operations go through HTTPS. These include application
deploy, catalog install, observability queries, anything that depends on
the backend's persisted state.

The single entry point is [`ApiClient`](../src/lib/api-client.ts), an axios
wrapper that reads the resolved API base URL and bearer token from the
active profile.

```ts
const api = app.get(ApiClient);
await api.post('/applications/deploy-from-yaml', { yaml, repo, branch });
```

A given command may use either mode or both. For example
`flui env update-firewall` is direct provider (firewall lives outside the
cluster) while `flui app deploy` is API (deployment is a backend job).

## Storage layout: `~/.flui/`

Everything the CLI persists lives under the user's home directory. The
[`ProfileManager`](../src/lib/profile-manager.ts) abstracts this layout.

```
~/.flui/
├── context              # plain-text file containing the active profile name
├── profiles/
│   ├── default/
│   │   ├── .env         # process env loaded by NestJS ConfigModule
│   │   ├── .key         # encrypted token vault (AES-256-GCM)
│   │   ├── config.json  # non-secret preferences (email, defaults, ...)
│   │   ├── clusters.json
│   │   ├── nodes.json
│   │   ├── operations.json
│   │   ├── firewalls.json
│   │   ├── vnets.json
│   │   ├── ca/          # cluster CAs persisted for kubectl reuse
│   │   └── logs/        # rolling command logs
│   └── <other-profile>/
│       └── ... same shape
└── (legacy files from older layouts are migrated on first run)
```

The active profile is resolved by, in order: the `FLUI_PROFILE` env var,
the `~/.flui/context` file, then the `default` profile name. Profile
switching (`flui context use <name>`) only rewrites the `context` file —
no data is moved.

The token vault and the preferences file follow different rules; the full
contract is documented in [`CONFIGURATION.md`](CONFIGURATION.md).

## What the CLI shares with `flui.api`

The CLI's two NestJS modules wire together a mix of CLI-specific services
and modules imported verbatim from `../src/modules/`. Today's shared
surface, with one-way dependency CLI → API:

```
imported from ../src/ by cli/:
  modules/providers/                  (entire ProviderCoreModule + impls)
  modules/common/                     (LabelService, etc.)
  modules/shared/encryption/
  modules/infrastructure/shared/      (KubernetesService, LabelService)
  modules/infrastructure/clusters/entities/   (used as TypeScript types)
  modules/infrastructure/firewalls/templates/
  modules/providers/dto/node-size.dto
```

This works because of the path alias `src/* → ../src/*` in
[`cli/tsconfig.json`](../tsconfig.json) and a TypeORM-free shim that
provides the small surface (`getRepositoryToken`) some shared modules
expect. The compiled CLI bundle includes only the transitive closure of
the symbols actually referenced at runtime, not the whole backend.

The reverse direction is empty: nothing in `src/` imports from `cli/`.

This sharing is intentional and structural, not accidental: the CLI is the
"local executor" of the same operations the backend performs in the cloud.
Splitting the shared modules into a third `@flui-cloud/core` package is on
the long-term roadmap but is **not** required for the CLI to function — see
the project's quality and split policy for the timeline.

## Provider plug-in architecture

Cloud providers are pluggable behind three factories:

- `ProviderFactory` — server lifecycle (create, list, delete)
- `FirewallProviderFactory` — firewall CRUD
- `DnsProviderFactory` — DNS records (when applicable)

Each concrete provider lives in its own NestJS module
(`HetznerProviderModule`, `ContaboProviderModule`, ...) and implements the
corresponding interface (`IProvider`, `IFirewallProvider`, `IDnsProvider`).

`CliProvidersModule` imports the modules of every supported provider and
registers them with the factories. Adding a new provider is therefore
purely additive: drop a new `XxxProviderModule` under
`src/modules/providers/implementations/xxx/`, register it in
`CliProvidersModule`, and the factories pick it up.

## Profiles and multi-environment usage

Profiles are an isolation boundary. Two profiles never share state — each
has its own clusters, firewalls, tokens and preferences. Common usage:

- `default` — personal sandbox with personal Hetzner token
- `gojo-staging` — work environment with company-issued tokens
- `customer-x` — managed customer environment

The CLI reads from exactly one profile at a time, resolved as described
above. To run a one-off command against a different profile without
switching the global context:

```bash
FLUI_PROFILE=customer-x flui cluster ls
```

## Bootstrap flow (case study: `flui env create`)

The most architecturally interesting command is `flui env create`. It
provisions a brand-new "observability cluster" on a cloud provider from
zero, where "zero" means the user has only a provider token in the local
vault. End-to-end shape (simplified, see
[`cli/src/commands/env/create.ts`](../src/commands/env/create.ts) for the
authoritative version):

1. **Validate inputs** (provider, region, server type) — read from preferences
   or interactive prompts.
2. **Create vnet** via `VnetProvisioningService` (direct provider).
3. **Create firewall** via `HetznerFirewallService` (direct provider).
   Persisted in `firewalls.json`.
4. **Create the master node** via `ProviderFactory.getProvider().createServer(...)`
   with cloud-init that installs k3s.
5. **Wait for k3s readiness**, fetch kubeconfig, store CA in
   `~/.flui/profiles/<name>/ca/`.
6. **Apply firewall to the new server** via
   `firewallService.applyToServers(...)`.
7. **Persist** cluster + node records in the local JSON files.
8. **Optionally deploy `flui.api`** to the new cluster (helm/manifests
   layer) and prompt the user to `flui auth login` — at which point the
   CLI switches to the HTTP API mode for subsequent operations.

Steps 1–7 are all **direct provider mode**. Step 8 is the inflection point
between bootstrap and runtime. After it, the CLI primarily talks HTTP to
the deployed backend, with rare exceptions like
`flui env update-firewall` which remain direct because the firewall lives
outside Kubernetes' control plane and the backend has no privilege over it.

## Build, packaging and distribution

```
cli/
└── package.json                  → name: @flui-cloud/cli, version: x.y.z
   ├── prebuild: copy templates/ and instance bootstrap scripts into lib/
   ├── build:    tsc && tsc-alias  (rewrites src/* alias to ../src/* in lib/)
   ├── prepack:  npm run build && oclif manifest
   └── postpack: rm oclif.manifest.json
```

Published artifacts include `lib/`, `bin/`, the oclif manifest, the user
docs and `package.json`. Templates and scripts that the CLI reads at
runtime are copied into `lib/templates/` and
`lib/src/modules/instances/assets/scripts/` during `prebuild`.

Users install the CLI globally:

```bash
npm install -g @flui-cloud/cli
flui --version
```

The `@oclif/plugin-warn-if-update-available` plugin is bundled, so users
are notified once per day when a newer version is available on npm.

## Design choices worth knowing about

### Why NestJS in a CLI?

It saves writing two parallel implementations of every infrastructure
operation. The provider services, encryption module, label service and
similar are non-trivial pieces of code; reusing them in CLI mode means
the bootstrap path exercises the same code that the backend uses on
clusters, which catches bugs in both directions.

The cost is bootstrap latency: spinning up the NestJS container takes
~150–300 ms on a warm machine. Acceptable for an operator tool that
typically runs interactively.

### Why file-based storage instead of SQLite?

SQLite would unlock real queries and a single-file backup story, but it
adds a native dependency, complicates cross-platform packaging, and would
not be queried often enough to justify the surface. JSON files are
human-inspectable, debuggable with `cat` + `jq`, and trivially backed up
with `tar`. The persistence patterns of a CLI rarely benefit from SQL.

### Why two access modes instead of always-via-API?

Bootstrap demands direct provider access (no API exists yet). Once the
direct mode is implemented, requiring the API for runtime operations
that the CLI could perform locally would be an arbitrary constraint with
no architectural benefit. The cost of the duality is marginal because
both modes share the underlying provider services.

### Why share `flui.api` modules instead of re-implementing?

See the previous section. The shared surface is not glue; it is the
substance of the operations themselves. Reimplementing it would double
the maintenance and create drift between local and remote semantics.

## Roadmap

These items are flagged here so contributors don't propose them as
"obvious gaps" — they are known and intentionally deferred:

- **Extract `@flui-cloud/core`** — turn `src/modules/{providers,common,
encryption,infrastructure/shared}` into a separately published package
  consumed by both the CLI and the backend. Will eliminate the
  `src/* → ../src/*` path alias and let the CLI live in its own
  repository (`flui-cloud/flui-cli`). Tracked separately; depends on
  having a stabilised provider API.
- **Plugin system for third-party providers** — today, supporting a new
  provider requires a PR to the core. A future plugin loader would let
  third parties ship `@flui-cloud/provider-<name>` packages installable
  by users.
- **Output format flag** — most commands print human-readable text. A
  global `--json` flag and a stable JSON schema for each command's output
  would unlock scripting against the CLI.
