import { Module, OnModuleInit } from '@nestjs/common';
import { AstroDetectorService } from './astro-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [AstroDetectorService],
  exports: [AstroDetectorService],
})
export class AstroDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: AstroDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
