import { Module, OnModuleInit } from '@nestjs/common';
import { DockerfileDetectorService } from './dockerfile-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

/**
 * Dockerfile Detector Module
 * Registers the Dockerfile passthrough detector
 */
@Module({
  imports: [FrameworkCoreModule],
  providers: [DockerfileDetectorService],
  exports: [DockerfileDetectorService],
})
export class DockerfileDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: DockerfileDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  /**
   * Register detector on module initialization
   */
  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
