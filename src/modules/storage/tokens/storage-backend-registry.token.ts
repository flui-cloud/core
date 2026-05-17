import { FactoryProvider, Provider } from '@nestjs/common';
import { StorageBackendProvider } from '../enums/storage-backend-provider.enum';
import { IBackupStorageBackend } from '../interfaces/backup-storage-backend.interface';

export const BACKUP_STORAGE_BACKEND_REGISTRY =
  'BACKUP_STORAGE_BACKEND_REGISTRY';

export interface BackupStorageBackendRegistration {
  provider: StorageBackendProvider;
  backend: IBackupStorageBackend;
}

export type MultiProvider<T = unknown> = FactoryProvider<T> & { multi: true };

export function multiBackupStorageProvider(
  p: MultiProvider<BackupStorageBackendRegistration>,
): Provider {
  return p as unknown as Provider;
}
