import { Module } from '@nestjs/common';
import { GenericS3Backend } from './implementations/generic-s3.backend';
import { StorageBackendFactory } from './factories/storage-backend.factory';

@Module({
  providers: [GenericS3Backend, StorageBackendFactory],
  exports: [GenericS3Backend, StorageBackendFactory],
})
export class StorageModule {}
