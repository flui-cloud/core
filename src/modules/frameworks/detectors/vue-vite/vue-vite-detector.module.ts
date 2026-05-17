import { Module, OnModuleInit } from '@nestjs/common';
import { VueViteDetectorService } from './vue-vite-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [VueViteDetectorService],
  exports: [VueViteDetectorService],
})
export class VueViteDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: VueViteDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
