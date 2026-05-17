/**
 * Local mirror of provider credential schemas.
 *
 * This duplicates the contract that the API exposes via
 * `IProviderCapabilitiesService.getProviderInfo().credentialFields` because the
 * CLI runs *before* a Flui API exists (chicken-and-egg during environment
 * bootstrap) and the management endpoints require auth. When the API gains a
 * public schema endpoint, replace this file's source with a fetch and keep the
 * shape stable.
 *
 * Keep in sync with:
 *   src/modules/providers/implementations/<provider>/<provider>-capabilities.service.ts
 */
export type CliCredentialType = 'api_key' | 'access_key_secret';

export interface CliCredentialField {
  key: string;
  label: string;
  hint?: string;
  secret: boolean;
  required: boolean;
}

export interface CliProviderCredentialSchema {
  provider: 'hetzner' | 'scaleway';
  type: CliCredentialType;
  fields: CliCredentialField[];
}

export const PROVIDER_CREDENTIAL_SCHEMAS: Record<
  'hetzner' | 'scaleway',
  CliProviderCredentialSchema
> = {
  hetzner: {
    provider: 'hetzner',
    type: 'api_key',
    fields: [
      {
        key: 'apiKey',
        label: 'Hetzner API Token',
        hint: 'Hetzner Cloud Console → Security → API Tokens',
        secret: true,
        required: true,
      },
    ],
  },
  scaleway: {
    provider: 'scaleway',
    type: 'access_key_secret',
    fields: [
      {
        key: 'accessKey',
        label: 'Access Key ID',
        hint: 'Scaleway Console → IAM → API Keys → Access Key ID',
        secret: false,
        required: true,
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        hint: 'Scaleway Console → IAM → API Keys → Secret Key (shown once at creation)',
        secret: true,
        required: true,
      },
    ],
  },
};

export function getCredentialSchema(
  provider: string,
): CliProviderCredentialSchema | null {
  const key = provider.toLowerCase() as 'hetzner' | 'scaleway';
  return PROVIDER_CREDENTIAL_SCHEMAS[key] ?? null;
}

export function isCompoundProvider(provider: string): boolean {
  const schema = getCredentialSchema(provider);
  return schema?.type === 'access_key_secret';
}
