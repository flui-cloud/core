import { Module, OnModuleInit } from '@nestjs/common';
import { ReactRouterDetectorService } from './react-router-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [ReactRouterDetectorService],
  exports: [ReactRouterDetectorService],
})
export class ReactRouterDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: ReactRouterDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
