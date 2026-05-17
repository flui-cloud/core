import { Module } from '@nestjs/common';
import { LabelService } from './services/label.service';

@Module({
  providers: [LabelService],
  exports: [LabelService],
})
export class CommonModule {}
