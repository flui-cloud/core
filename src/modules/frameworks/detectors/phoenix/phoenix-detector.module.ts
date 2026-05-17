import { Module, OnModuleInit } from '@nestjs/common';
import { PhoenixDetectorService } from './phoenix-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [PhoenixDetectorService],
  exports: [PhoenixDetectorService],
})
export class PhoenixDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: PhoenixDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
