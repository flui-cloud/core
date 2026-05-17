import { Module, OnModuleInit } from '@nestjs/common';
import { DjangoDetectorService } from './django-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [DjangoDetectorService],
  exports: [DjangoDetectorService],
})
export class DjangoDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: DjangoDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
