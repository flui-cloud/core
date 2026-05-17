import { Module, OnModuleInit } from '@nestjs/common';
import { NuxtDetectorService } from './nuxt-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [NuxtDetectorService],
  exports: [NuxtDetectorService],
})
export class NuxtDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: NuxtDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
