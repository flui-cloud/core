import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ApiTokenRepository } from '../../../../access/repositories/api-token.repository';
import { CredentialType } from '../../../../management/entities/credentials.entity';
import { CloudProvider } from '../../../enums/cloud-provider.enum';
import { CredentialPurpose } from '../../../../access/enums/credential-purpose.enum';
import { KeyStorageService } from '../../../../access/services/key-storage.service';
import { GenericS3Backend } from '../../../../storage/implementations/generic-s3.backend';
import { StorageBackendProvider } from '../../../../storage/enums/storage-backend-provider.enum';

export interface ConnectHetznerObjectStorageInput {
  accessKey: string;
  secretKey: string;
  region?: string;
}

const DEFAULT_REGION = 'nbg1';

function endpointFor(region: string): string {
  return `https://${region}.your-objectstorage.com`;
}

@Injectable()
export class HetznerObjectStorageConnectionService {
  private readonly logger = new Logger(
    HetznerObjectStorageConnectionService.name,
  );

  constructor(
    private readonly apiTokenRepo: ApiTokenRepository,
    private readonly keyStorage: KeyStorageService,
    private readonly genericS3: GenericS3Backend,
  ) {}

  async connect(
    input: ConnectHetznerObjectStorageInput,
  ): Promise<{ ready: boolean; tokenId: string }> {
    const region = input.region ?? DEFAULT_REGION;
    const endpoint = endpointFor(region);
    const probeBucket = `flui-probe-${Date.now().toString(36)}`;

    // Validate creds via probe bucket create+delete
    try {
      await this.genericS3.ensureBucket({
        provider: StorageBackendProvider.HETZNER_OBJECT_STORAGE,
        endpoint,
        region,
        bucket: probeBucket,
        accessKey: input.accessKey,
        secretKey: input.secretKey,
        forcePathStyle: true,
      });
    } catch (err: any) {
      throw new BadRequestException(
        `Hetzner Object Storage credentials invalid: ${err?.message ?? err}`,
      );
    }
    // Best-effort cleanup of probe bucket
    try {
      await this.genericS3.deleteObjects(
        {
          provider: StorageBackendProvider.HETZNER_OBJECT_STORAGE,
          endpoint,
          region,
          bucket: probeBucket,
          accessKey: input.accessKey,
          secretKey: input.secretKey,
          forcePathStyle: true,
        },
        [],
      );
    } catch {
      // ignore — we couldn't enumerate, but the key is valid
    }

    // Disable previous OS credentials for Hetzner (only one active per user assumed for MVP)
    const existing = await this.apiTokenRepo.findByProviderAndPurpose(
      CloudProvider.HETZNER,
      CredentialPurpose.OBJECT_STORAGE,
    );
    for (const t of existing ?? []) {
      try {
        await this.apiTokenRepo.deleteToken(t.id);
      } catch (err: any) {
        this.logger.warn(
          `Failed to delete previous Hetzner OS token ${t.id}: ${err?.message}`,
        );
      }
    }

    const encryptedSecret = this.keyStorage.encryptKeyToString(input.secretKey);
    const encryptedAccess = this.keyStorage.encryptKeyToString(input.accessKey);
    const created = await this.apiTokenRepo.createToken(
      CloudProvider.HETZNER,
      `Hetzner Object Storage (${region})`,
      `Auto-saved by Flui at ${new Date().toISOString()}`,
      encryptedSecret,
      {
        credentialType: CredentialType.ACCESS_KEY_SECRET,
        encryptedAccessKey: encryptedAccess,
        purpose: CredentialPurpose.OBJECT_STORAGE,
      },
    );
    return { ready: true, tokenId: created.id };
  }

  async loadCreds(): Promise<{
    accessKey: string;
    secretKey: string;
    region: string;
  } | null> {
    const tokens = await this.apiTokenRepo.findByProviderAndPurpose(
      CloudProvider.HETZNER,
      CredentialPurpose.OBJECT_STORAGE,
    );
    const t = tokens?.[0];
    if (!t) return null;
    const secretKey = this.keyStorage.decryptKeyFromString(t.encrypted_token);
    const accessKey = t.encrypted_access_key
      ? this.keyStorage.decryptKeyFromString(t.encrypted_access_key)
      : '';
    // Region inferred from label "(nbg1)"
    const match = t.label ? /\((\w+)\)/.exec(t.label) : null;
    const region = match?.[1] ?? DEFAULT_REGION;
    return { accessKey, secretKey, region };
  }
}
