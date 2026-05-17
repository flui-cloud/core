import { Module, OnModuleInit } from '@nestjs/common';
import { LaravelDetectorService } from './laravel-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [LaravelDetectorService],
  exports: [LaravelDetectorService],
})
export class LaravelDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: LaravelDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
