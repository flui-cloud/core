import { Module, OnModuleInit } from '@nestjs/common';
import { GenericPythonDetectorService } from './generic-python-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [GenericPythonDetectorService],
  exports: [GenericPythonDetectorService],
})
export class GenericPythonDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: GenericPythonDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
