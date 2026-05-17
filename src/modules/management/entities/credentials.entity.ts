import { CloudProvider } from '../../providers/enums/cloud-provider.enum';

export enum CredentialType {
  API_KEY = 'api_key',
  ACCESS_KEY_SECRET = 'access_key_secret',
  USER_PASSWORD = 'user_password',
  BEARER_TOKEN = 'bearer_token',
}

export interface ProviderCredentials {
  provider: CloudProvider;
  type: CredentialType;

  // API Key fields (type: api_key)
  apiKey?: string;
  /** Optional expiry date — cannot be inferred from the key, must be provided by the user */
  expiresAt?: Date;

  // Access Key + Secret Key fields (type: access_key_secret)
  accessKey?: string;
  secretKey?: string;

  // User/Password fields (type: user_password)
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;

  // Bearer Token fields (type: bearer_token)
  bearerToken?: string;
}
