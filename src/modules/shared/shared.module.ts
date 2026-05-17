import { Module } from '@nestjs/common';
import { EncryptionModule } from './encryption/encryption.module';
import { ValidationModule } from './validation/validation.module';
import { UtilitiesModule } from './utilities/utilities.module';

@Module({
  imports: [EncryptionModule, ValidationModule, UtilitiesModule],
  exports: [EncryptionModule, ValidationModule, UtilitiesModule],
})
export class SharedModule {}
