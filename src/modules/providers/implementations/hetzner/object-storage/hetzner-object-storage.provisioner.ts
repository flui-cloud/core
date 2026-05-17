import { Injectable, Logger } from '@nestjs/common';
import {
  IObjectStorageProvisioner,
  ProvisionerCapability,
  ProvisionerReadiness,
  ProvisionInput,
  ProvisionResult,
} from '../../../../storage/interfaces/object-storage-provisioner.interface';
import { StorageBackendProvider } from '../../../../storage/enums/storage-backend-provider.enum';
import { GenericS3Backend } from '../../../../storage/implementations/generic-s3.backend';
import { HetznerObjectStorageConnectionService } from './hetzner-object-storage-connection.service';

const HETZNER_DEFAULT_REGION = 'nbg1';

function endpointFor(region: string): string {
  return `https://${region}.your-objectstorage.com`;
}

/**
 * Provisioner Hetzner Object Storage — SEMI_AUTO.
 * Hetzner Object Storage non espone API per gestire credenziali, quindi
 * l'utente deve incollarle una volta tramite il flusso "Connect Hetzner
 * Object Storage". Una volta collegate, il bucket viene creato automaticamente
 * via S3 API.
 */
@Injectable()
export class HetznerObjectStorageProvisioner
  implements IObjectStorageProvisioner
{
  private readonly logger = new Logger(HetznerObjectStorageProvisioner.name);
  readonly provider = StorageBackendProvider.HETZNER_OBJECT_STORAGE;
  readonly capability = ProvisionerCapability.SEMI_AUTO;

  constructor(
    private readonly connectionService: HetznerObjectStorageConnectionService,
    private readonly genericS3: GenericS3Backend,
  ) {}

  async isReady(_userId: string): Promise<ProvisionerReadiness> {
    const creds = await this.connectionService.loadCreds();
    if (!creds) {
      return {
        ready: false,
        reason: 'CONNECT_HETZNER_OBJECT_STORAGE_REQUIRED',
        message:
          'Per attivare i backup su Hetzner, collega le credenziali Hetzner Object Storage. Le trovi nella Hetzner Console → Project → Security → Object Storage Credentials.',
      };
    }
    return { ready: true };
  }

  async provisionDestination(input: ProvisionInput): Promise<ProvisionResult> {
    const creds = await this.connectionService.loadCreds();
    if (!creds) {
      throw new Error(
        'Hetzner Object Storage credentials not configured. Call connect endpoint first.',
      );
    }
    const region =
      input.desiredRegion ?? creds.region ?? HETZNER_DEFAULT_REGION;
    const endpoint = endpointFor(region);
    const bucket =
      input.desiredBucketName ?? this.defaultBucketName(input.userId);

    const exists = (
      await this.genericS3.testConnection({
        provider: this.provider,
        endpoint,
        region,
        bucket,
        accessKey: creds.accessKey,
        secretKey: creds.secretKey,
        forcePathStyle: true,
      })
    ).healthy;

    if (!exists) {
      await this.genericS3.ensureBucket({
        provider: this.provider,
        endpoint,
        region,
        bucket,
        accessKey: creds.accessKey,
        secretKey: creds.secretKey,
        forcePathStyle: true,
      });
    }

    return {
      bucket,
      region,
      endpoint,
      forcePathStyle: true,
      pathPrefix: `flui/${input.clusterId}`,
      accessKey: creds.accessKey,
      secretKey: creds.secretKey,
      // Costi calcolati dal BillingEstimatorService (per-provider table) in cents-per-TB.
      usableForEtcdL1: true,
      alreadyExisted: exists,
    };
  }

  private defaultBucketName(userId: string): string {
    const short = userId.replaceAll('-', '').slice(0, 12).toLowerCase();
    return `flui-backups-${short}`;
  }
}
