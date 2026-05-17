import { Module, OnModuleInit } from '@nestjs/common';
import { FastApiDetectorService } from './fastapi-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [FastApiDetectorService],
  exports: [FastApiDetectorService],
})
export class FastApiDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: FastApiDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
