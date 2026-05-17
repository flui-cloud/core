import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { StorageBackendProvider } from '../enums/storage-backend-provider.enum';
import { IObjectStorageProvisioner } from '../interfaces/object-storage-provisioner.interface';
import {
  OBJECT_STORAGE_PROVISIONER_REGISTRY,
  ObjectStorageProvisionerRegistration,
} from '../tokens/object-storage-provisioner-registry.token';

@Injectable()
export class ObjectStorageProvisionerFactory {
  private readonly logger = new Logger(ObjectStorageProvisionerFactory.name);
  private readonly registry = new Map<
    StorageBackendProvider,
    IObjectStorageProvisioner
  >();

  constructor(
    @Optional()
    @Inject(OBJECT_STORAGE_PROVISIONER_REGISTRY)
    registrations:
      | ObjectStorageProvisionerRegistration
      | ObjectStorageProvisionerRegistration[]
      | null,
  ) {
    let list: ObjectStorageProvisionerRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.provisioner);
    }
  }

  forProvider(
    provider: StorageBackendProvider,
  ): IObjectStorageProvisioner | null {
    return this.registry.get(provider) ?? null;
  }

  getRegisteredProviders(): StorageBackendProvider[] {
    return Array.from(this.registry.keys());
  }

  hasProvisioner(provider: StorageBackendProvider): boolean {
    return this.registry.has(provider);
  }
}
