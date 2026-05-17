import { Module, OnModuleInit } from '@nestjs/common';
import { NestJsDetectorService } from './nestjs-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

/**
 * NestJS Detector Module
 * Registers the NestJS framework detector
 */
@Module({
  imports: [FrameworkCoreModule],
  providers: [NestJsDetectorService],
  exports: [NestJsDetectorService],
})
export class NestJsDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: NestJsDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
