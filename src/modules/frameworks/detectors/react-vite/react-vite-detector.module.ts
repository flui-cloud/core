import { Module, OnModuleInit } from '@nestjs/common';
import { ReactViteDetectorService } from './react-vite-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [ReactViteDetectorService],
  exports: [ReactViteDetectorService],
})
export class ReactViteDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: ReactViteDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
