import { Module, OnModuleInit } from '@nestjs/common';
import { FlaskDetectorService } from './flask-detector.service';
import {
  FrameworkCoreModule,
  FrameworkRegistryService,
} from '../../framework-core';

@Module({
  imports: [FrameworkCoreModule],
  providers: [FlaskDetectorService],
  exports: [FlaskDetectorService],
})
export class FlaskDetectorModule implements OnModuleInit {
  constructor(
    private readonly detectorService: FlaskDetectorService,
    private readonly registry: FrameworkRegistryService,
  ) {}

  onModuleInit() {
    this.registry.registerDetector(this.detectorService);
  }
}
