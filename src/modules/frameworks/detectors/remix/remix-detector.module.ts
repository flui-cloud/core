import { Module, OnModuleInit } from '@nestjs/common';
import { RemixDetectorService } from './remix-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [RemixDetectorService],
  exports: [RemixDetectorService],
})
export class RemixDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: RemixDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
