import { Module, OnModuleInit } from '@nestjs/common';
import { SvelteKitDetectorService } from './svelte-kit-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [SvelteKitDetectorService],
  exports: [SvelteKitDetectorService],
})
export class SvelteKitDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: SvelteKitDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
