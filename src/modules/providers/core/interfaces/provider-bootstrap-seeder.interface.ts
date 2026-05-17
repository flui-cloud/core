import { CloudProvider } from '../../enums/cloud-provider.enum';
import { CredentialType } from '../../../management/entities/credentials.entity';

/**
 * Plain (unencrypted) credential payload returned by a provider's
 * bootstrap seeder when the relevant env vars are present.
 *
 * The orchestrator (`BootstrapSeeder` in the auth module) handles
 * encryption + persistence — provider modules stay free of access to
 * `KeyStorageService` and the `api_tokens` table.
 */
export interface ProviderBootstrapCredentials {
  credentialType: CredentialType;
  /** Single-token credential or, for ACCESS_KEY_SECRET, the secret part. */
  token: string;
  /** ACCESS_KEY_SECRET only: the access-key ID. */
  accessKey?: string;
  /** Human-readable label stored alongside the token. */
  label: string;
  /** Optional notes (default: "Auto-seeded from flui-secrets at cluster bootstrap"). */
  notes?: string;
}

/**
 * Per-provider strategy used by `BootstrapSeeder.seedProvider()` to:
 *
 *   - decide whether the running pod's env carries credentials for this provider,
 *   - return them in a normalized shape, and
 *   - optionally resolve the cloud-provider resource ID for the master server
 *     (numeric for Hetzner, opaque string for Scaleway).
 *
 * Implementations live in their respective provider implementation modules
 * and are registered through `PROVIDER_BOOTSTRAP_SEEDER_REGISTRY`.
 */
export interface IProviderBootstrapSeeder {
  readonly provider: CloudProvider;

  /**
   * Read the relevant env vars and, if present, return the credential payload
   * to persist. Return null when the env doesn't include credentials for this
   * provider — the orchestrator skips it silently.
   */
  buildCredentials(env: NodeJS.ProcessEnv): ProviderBootstrapCredentials | null;

  /**
   * Resolve the cloud-provider native resource ID for the bootstrap master
   * server. Used to backfill the provider_resource_id column.
   *
   * If the env-supplied value already matches the provider's native shape,
   * return it as-is. Implementations may also call the provider API to fetch
   * the canonical ID by name.
   */
  resolveProviderResourceId(args: {
    instanceId: string;
    instanceName: string;
    env: NodeJS.ProcessEnv;
  }): Promise<string>;
}
