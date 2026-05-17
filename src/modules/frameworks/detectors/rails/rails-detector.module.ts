import { Module, OnModuleInit } from '@nestjs/common';
import { RailsDetectorService } from './rails-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [RailsDetectorService],
  exports: [RailsDetectorService],
})
export class RailsDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: RailsDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
