import { Module, OnModuleInit } from '@nestjs/common';
import { FastHtmlDetectorService } from './fasthtml-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [FastHtmlDetectorService],
  exports: [FastHtmlDetectorService],
})
export class FastHtmlDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: FastHtmlDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
