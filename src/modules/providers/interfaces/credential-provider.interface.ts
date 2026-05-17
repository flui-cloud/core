import { CloudProvider } from '../enums/cloud-provider.enum';
import { BearerTokenDto } from '../../access/dto/bearer-token.dto';

export interface AccessKeyPair {
  /** The access key ID (public identifier) */
  accessKey: string;
  /** The secret key used for API authentication */
  secretKey: string;
}

export interface ICredentialProvider {
  /**
   * Get active API token for a specific cloud provider (type: api_key).
   */
  getActiveApiToken(provider: CloudProvider): Promise<string>;

  /**
   * Get active access key pair for a specific cloud provider (type: access_key_secret).
   * Returns both the access key ID and the secret key.
   */
  getActiveAccessKeyPair(provider: CloudProvider): Promise<AccessKeyPair>;

  /**
   * Get active bearer token for a specific cloud provider (type: user_password / bearer_token).
   */
  getActiveBearerToken(provider: CloudProvider): Promise<BearerTokenDto>;
}
