import { Module, OnModuleInit } from '@nestjs/common';
import { SpringBootDetectorService } from './spring-boot-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [SpringBootDetectorService],
  exports: [SpringBootDetectorService],
})
export class SpringBootDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: SpringBootDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
