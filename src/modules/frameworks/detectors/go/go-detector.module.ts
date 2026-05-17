import { Module, OnModuleInit } from '@nestjs/common';
import { GoDetectorService } from './go-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [GoDetectorService],
  exports: [GoDetectorService],
})
export class GoDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: GoDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
