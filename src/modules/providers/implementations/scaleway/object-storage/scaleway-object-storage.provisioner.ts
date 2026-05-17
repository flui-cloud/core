import { Injectable, Logger } from '@nestjs/common';
import {
  IObjectStorageProvisioner,
  ProvisionerCapability,
  ProvisionerReadiness,
  ProvisionInput,
  ProvisionResult,
} from '../../../../storage/interfaces/object-storage-provisioner.interface';
import { StorageBackendProvider } from '../../../../storage/enums/storage-backend-provider.enum';
import { ApiTokenRepository } from '../../../../access/repositories/api-token.repository';
import { CredentialPurpose } from '../../../../access/enums/credential-purpose.enum';
import { CredentialType } from '../../../../management/entities/credentials.entity';
import { CloudProvider } from '../../../enums/cloud-provider.enum';
import { KeyStorageService } from '../../../../access/services/key-storage.service';
import { GenericS3Backend } from '../../../../storage/implementations/generic-s3.backend';

const SCALEWAY_DEFAULT_REGION = 'fr-par';

function endpointFor(region: string): string {
  return `https://s3.${region}.scw.cloud`;
}

/**
 * Provisioner Scaleway Object Storage — FULL_AUTO.
 * Riusa le credenziali Scaleway compute esistenti (Scaleway IAM access keys
 * unificati: la stessa key opera su Compute API e Object Storage S3 API).
 *
 * Future: estendere ScalewayIamAdapter con createApplicationKey scoped al
 * bucket per least-privilege per-destination.
 */
@Injectable()
export class ScalewayObjectStorageProvisioner
  implements IObjectStorageProvisioner
{
  private readonly logger = new Logger(ScalewayObjectStorageProvisioner.name);
  readonly provider = StorageBackendProvider.SCALEWAY_OBJECT_STORAGE;
  readonly capability = ProvisionerCapability.FULL_AUTO;

  constructor(
    private readonly apiTokenRepo: ApiTokenRepository,
    private readonly keyStorage: KeyStorageService,
    private readonly genericS3: GenericS3Backend,
  ) {}

  async isReady(_userId: string): Promise<ProvisionerReadiness> {
    const tokens = await this.apiTokenRepo.findByProviderAndPurpose(
      CloudProvider.SCALEWAY,
      CredentialPurpose.COMPUTE,
    );
    const hasAccessKey = tokens?.some(
      (t) => t.credential_type === CredentialType.ACCESS_KEY_SECRET,
    );
    if (!hasAccessKey) {
      return {
        ready: false,
        reason: 'CONNECT_SCALEWAY_REQUIRED',
        message:
          'Scaleway non collegato. Aggiungi credenziali Scaleway nelle impostazioni provider.',
      };
    }
    return { ready: true };
  }

  async provisionDestination(input: ProvisionInput): Promise<ProvisionResult> {
    const region = input.desiredRegion ?? SCALEWAY_DEFAULT_REGION;
    const endpoint = endpointFor(region);
    const bucket =
      input.desiredBucketName ?? this.defaultBucketName(input.userId);
    const { accessKey, secretKey } = await this.loadScalewayCreds();
    const alreadyExisted = await this.bucketExists(
      endpoint,
      region,
      bucket,
      accessKey,
      secretKey,
    );
    if (!alreadyExisted) {
      await this.genericS3.ensureBucket({
        provider: this.provider,
        endpoint,
        region,
        bucket,
        accessKey,
        secretKey,
        forcePathStyle: false,
      });
    }
    return {
      bucket,
      region,
      endpoint,
      forcePathStyle: false,
      pathPrefix: `flui/${input.clusterId}`,
      accessKey,
      secretKey,
      // Costi calcolati dal BillingEstimatorService (per-provider table) in cents-per-TB.
      usableForEtcdL1: true,
      alreadyExisted,
    };
  }

  private defaultBucketName(userId: string): string {
    const short = userId.replaceAll('-', '').slice(0, 12).toLowerCase();
    return `flui-backups-${short}`;
  }

  private async loadScalewayCreds(): Promise<{
    accessKey: string;
    secretKey: string;
  }> {
    const tokens = await this.apiTokenRepo.findByProviderAndPurpose(
      CloudProvider.SCALEWAY,
      CredentialPurpose.COMPUTE,
    );
    const t = tokens?.find(
      (x) => x.credential_type === CredentialType.ACCESS_KEY_SECRET,
    );
    if (!t) throw new Error('Scaleway access key not found');
    const secretKey = this.keyStorage.decryptKeyFromString(t.encrypted_token);
    const accessKey = t.encrypted_access_key
      ? this.keyStorage.decryptKeyFromString(t.encrypted_access_key)
      : '';
    return { accessKey, secretKey };
  }

  private async bucketExists(
    endpoint: string,
    region: string,
    bucket: string,
    accessKey: string,
    secretKey: string,
  ): Promise<boolean> {
    const result = await this.genericS3.testConnection({
      provider: this.provider,
      endpoint,
      region,
      bucket,
      accessKey,
      secretKey,
      forcePathStyle: false,
    });
    return result.healthy;
  }
}
