import { Module, OnModuleInit } from '@nestjs/common';
import { AspNetCoreDetectorService } from './aspnet-core-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [AspNetCoreDetectorService],
  exports: [AspNetCoreDetectorService],
})
export class AspNetCoreDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: AspNetCoreDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
