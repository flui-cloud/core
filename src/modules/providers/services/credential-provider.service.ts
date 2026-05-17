import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ICredentialProvider,
  AccessKeyPair,
} from '../interfaces/credential-provider.interface';
import { CloudProvider } from '../enums/cloud-provider.enum';
import { CredentialType } from '../../management/entities/credentials.entity';
import { BearerTokenDto } from '../../access/dto/bearer-token.dto';
import { ProviderCredentialsRepository } from '../../access/repositories/provider-credentials.repository';
import { ApiTokenRepository } from '../../access/repositories/api-token.repository';
import { KeyStorageService } from '../../access/services/key-storage.service';
import { CredentialPurpose } from '../../access/enums/credential-purpose.enum';

@Injectable()
export class CredentialProviderService implements ICredentialProvider {
  constructor(
    private readonly providerCredentialsRepository: ProviderCredentialsRepository,
    private readonly apiTokenRepository: ApiTokenRepository,
    private readonly keyStorage: KeyStorageService,
  ) {}

  async getActiveApiToken(
    provider: CloudProvider,
    purpose: CredentialPurpose = CredentialPurpose.COMPUTE,
  ): Promise<string> {
    const tokens = await this.apiTokenRepository.findByProviderAndPurpose(
      provider,
      purpose,
    );
    if (!tokens || tokens.length === 0) {
      throw new NotFoundException('No active API token found');
    }
    const token = tokens[0];
    return await this.getDecryptApiToken(token.id);
  }

  async getActiveAccessKeyPair(
    provider: CloudProvider,
    purpose: CredentialPurpose = CredentialPurpose.COMPUTE,
  ): Promise<AccessKeyPair> {
    const tokens = await this.apiTokenRepository.findByProviderAndPurpose(
      provider,
      purpose,
    );
    const token = tokens?.find(
      (t) => t.credential_type === CredentialType.ACCESS_KEY_SECRET,
    );
    if (!token) {
      throw new NotFoundException(
        `No active access key pair found for provider ${provider}`,
      );
    }
    const secretKey = this.keyStorage.decryptKeyFromString(
      token.encrypted_token,
    );
    const accessKey = token.encrypted_access_key
      ? this.keyStorage.decryptKeyFromString(token.encrypted_access_key)
      : '';
    return { accessKey, secretKey };
  }

  async getActiveBearerToken(provider: CloudProvider): Promise<BearerTokenDto> {
    const providerCredentials =
      await this.providerCredentialsRepository.findByProvider(provider);

    if (!providerCredentials || providerCredentials.length === 0) {
      throw new NotFoundException('No active credentials found');
    }

    const credentials = providerCredentials[0];

    // Return the bearer token data
    return {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expires_in: credentials.token_expires_at
        ? Math.floor(
            (credentials.token_expires_at.getTime() - Date.now()) / 1000,
          )
        : 3600,
      token_type: 'Bearer',
      scope: '',
    } as BearerTokenDto;
  }

  private async getDecryptApiToken(id: string): Promise<string> {
    try {
      const encryptedToken =
        await this.apiTokenRepository.getEncryptedToken(id);
      return this.keyStorage.decryptKeyFromString(encryptedToken);
    } catch {
      throw new NotFoundException(`API token with ID ${id} not found`);
    }
  }
}
