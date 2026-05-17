import { Module, OnModuleInit } from '@nestjs/common';
import { AngularDetectorService } from './angular-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

/**
 * Angular Detector Module
 * Registers the Angular framework detector
 */
@Module({
  imports: [FrameworkCoreModule],
  providers: [AngularDetectorService],
  exports: [AngularDetectorService],
})
export class AngularDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: AngularDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
