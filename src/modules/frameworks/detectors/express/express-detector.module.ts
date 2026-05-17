import { Module, OnModuleInit } from '@nestjs/common';
import { ExpressDetectorService } from './express-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [ExpressDetectorService],
  exports: [ExpressDetectorService],
})
export class ExpressDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: ExpressDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
