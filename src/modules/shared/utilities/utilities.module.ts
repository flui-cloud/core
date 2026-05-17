import { Module } from '@nestjs/common';
import { FileSystemService } from './services/file-system.service';
import { TemplateRenderingService } from './services/template-rendering.service';

@Module({
  providers: [FileSystemService, TemplateRenderingService],
  exports: [FileSystemService, TemplateRenderingService],
})
export class UtilitiesModule {}
