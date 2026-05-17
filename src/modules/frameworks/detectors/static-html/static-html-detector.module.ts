import { Module, OnModuleInit } from '@nestjs/common';
import { StaticHtmlDetectorService } from './static-html-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [StaticHtmlDetectorService],
  exports: [StaticHtmlDetectorService],
})
export class StaticHtmlDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: StaticHtmlDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
