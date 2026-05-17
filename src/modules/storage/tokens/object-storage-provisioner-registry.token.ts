import { FactoryProvider, Provider } from '@nestjs/common';
import { StorageBackendProvider } from '../enums/storage-backend-provider.enum';
import { IObjectStorageProvisioner } from '../interfaces/object-storage-provisioner.interface';

export const OBJECT_STORAGE_PROVISIONER_REGISTRY =
  'OBJECT_STORAGE_PROVISIONER_REGISTRY';

export interface ObjectStorageProvisionerRegistration {
  provider: StorageBackendProvider;
  provisioner: IObjectStorageProvisioner;
}

export type MultiProvider<T = unknown> = FactoryProvider<T> & { multi: true };

export function multiProvisionerProvider(
  p: MultiProvider<ObjectStorageProvisionerRegistration>,
): Provider {
  return p as unknown as Provider;
}
