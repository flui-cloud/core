import { Module, OnModuleInit } from '@nestjs/common';
import { TanStackStartDetectorService } from './tanstack-start-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [TanStackStartDetectorService],
  exports: [TanStackStartDetectorService],
})
export class TanStackStartDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: TanStackStartDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
