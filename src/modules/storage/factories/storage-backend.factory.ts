import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { StorageBackendProvider } from '../enums/storage-backend-provider.enum';
import { IBackupStorageBackend } from '../interfaces/backup-storage-backend.interface';
import {
  BACKUP_STORAGE_BACKEND_REGISTRY,
  BackupStorageBackendRegistration,
} from '../tokens/storage-backend-registry.token';
import { GenericS3Backend } from '../implementations/generic-s3.backend';

@Injectable()
export class StorageBackendFactory {
  private readonly logger = new Logger(StorageBackendFactory.name);
  private readonly registry = new Map<
    StorageBackendProvider,
    IBackupStorageBackend
  >();

  constructor(
    @Optional()
    @Inject(BACKUP_STORAGE_BACKEND_REGISTRY)
    registrations:
      | BackupStorageBackendRegistration
      | BackupStorageBackendRegistration[]
      | null,
    private readonly genericS3: GenericS3Backend,
  ) {
    let list: BackupStorageBackendRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.backend);
    }
  }

  forProvider(provider: StorageBackendProvider): IBackupStorageBackend {
    const registered = this.registry.get(provider);
    if (registered) return registered;
    // Fallback to generic S3 for unregistered S3-compatible providers
    return this.genericS3;
  }

  getRegisteredProviders(): StorageBackendProvider[] {
    return Array.from(this.registry.keys());
  }
}
