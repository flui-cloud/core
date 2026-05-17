import { Module, OnModuleInit } from '@nestjs/common';
import { NextJsDetectorService } from './nextjs-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

/**
 * Next.js Detector Module
 * Registers the Next.js framework detector
 */
@Module({
  imports: [FrameworkCoreModule],
  providers: [NextJsDetectorService],
  exports: [NextJsDetectorService],
})
export class NextJsDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: NextJsDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
