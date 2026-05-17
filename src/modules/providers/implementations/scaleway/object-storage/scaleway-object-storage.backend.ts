import { Injectable } from '@nestjs/common';
import { GenericS3Backend } from '../../../../storage/implementations/generic-s3.backend';
import { StorageBackendProvider } from '../../../../storage/enums/storage-backend-provider.enum';
import {
  StorageBackendCredentials,
  VeleroBSLConfig,
  RcloneRemoteConfig,
} from '../../../../storage/interfaces/backup-storage-backend.interface';

@Injectable()
export class ScalewayObjectStorageBackend extends GenericS3Backend {
  readonly provider: StorageBackendProvider =
    StorageBackendProvider.SCALEWAY_OBJECT_STORAGE;

  toVeleroBSL(creds: StorageBackendCredentials): VeleroBSLConfig {
    return {
      provider: 'aws',
      config: {
        region: creds.region,
        s3ForcePathStyle: 'false',
        s3Url: creds.endpoint,
      },
      credentialsKey: 'cloud',
      bucket: creds.bucket,
      prefix: creds.pathPrefix,
    };
  }

  toRcloneRemote(creds: StorageBackendCredentials): RcloneRemoteConfig {
    return {
      type: 's3',
      provider: 'Scaleway',
      env: {
        type: 's3',
        provider: 'Scaleway',
        endpoint: creds.endpoint,
        region: creds.region,
        access_key_id: creds.accessKey,
        secret_access_key: creds.secretKey,
      },
    };
  }
}
