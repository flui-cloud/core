import { Module, OnModuleInit } from '@nestjs/common';
import { GenericNodeDetectorService } from './generic-node-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [GenericNodeDetectorService],
  exports: [GenericNodeDetectorService],
})
export class GenericNodeDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: GenericNodeDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
