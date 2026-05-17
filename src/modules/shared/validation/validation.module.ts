import { Module } from '@nestjs/common';
import { GitValidationService } from './services/git-validation.service';

@Module({
  providers: [GitValidationService],
  exports: [GitValidationService],
})
export class ValidationModule {}
