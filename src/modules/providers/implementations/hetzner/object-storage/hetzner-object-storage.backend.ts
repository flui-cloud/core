import { Injectable } from '@nestjs/common';
import { GenericS3Backend } from '../../../../storage/implementations/generic-s3.backend';
import { StorageBackendProvider } from '../../../../storage/enums/storage-backend-provider.enum';
import {
  StorageBackendCredentials,
  VeleroBSLConfig,
} from '../../../../storage/interfaces/backup-storage-backend.interface';

@Injectable()
export class HetznerObjectStorageBackend extends GenericS3Backend {
  readonly provider: StorageBackendProvider =
    StorageBackendProvider.HETZNER_OBJECT_STORAGE;

  toVeleroBSL(creds: StorageBackendCredentials): VeleroBSLConfig {
    return {
      provider: 'aws',
      config: {
        region: creds.region,
        s3ForcePathStyle: 'true',
        s3Url: creds.endpoint,
      },
      credentialsKey: 'cloud',
      bucket: creds.bucket,
      prefix: creds.pathPrefix,
    };
  }
}
