import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  IFrameworkDetector,
  IFrameworkMetadata,
} from '../interfaces/framework-detector.interface';
import { FrameworkType } from '../enums';

/**
 * Registry service for framework detectors
 * Manages registration, discovery, and retrieval of framework detectors
 */
@Injectable()
export class FrameworkRegistryService implements OnModuleInit {
  private readonly logger = new Logger(FrameworkRegistryService.name);
  private readonly detectors = new Map<string, IFrameworkDetector>();
  private sortedDetectors: IFrameworkDetector[] = [];

  /**
   * Register a framework detector
   */
  registerDetector(detector: IFrameworkDetector): void {
    const metadata = detector.getMetadata();
    const key = this.getDetectorKey(metadata);

    if (this.detectors.has(key)) {
      this.logger.warn(
        `Detector for ${metadata.frameworkType} already registered, overwriting`,
      );
    }

    this.detectors.set(key, detector);
    this.logger.log(
      `Registered detector: ${metadata.detectorName} (${metadata.frameworkType}) v${metadata.detectorVersion}`,
    );

    // Re-sort detectors by priority
    this.sortDetectorsByPriority();
  }

  /**
   * Unregister a framework detector
   */
  unregisterDetector(frameworkType: FrameworkType): void {
    const key = this.getDetectorKey({ frameworkType } as IFrameworkMetadata);
    const deleted = this.detectors.delete(key);

    if (deleted) {
      this.logger.log(`Unregistered detector for ${frameworkType}`);
      this.sortDetectorsByPriority();
    }
  }

  /**
   * Get a specific detector by framework type
   */
  getDetector(frameworkType: FrameworkType): IFrameworkDetector | undefined {
    const key = this.getDetectorKey({ frameworkType } as IFrameworkMetadata);
    return this.detectors.get(key);
  }

  /**
   * Get all registered detectors sorted by priority (highest first)
   */
  getAllDetectors(): IFrameworkDetector[] {
    return [...this.sortedDetectors];
  }

  /**
   * Get all detector metadata
   */
  getAllMetadata(): IFrameworkMetadata[] {
    return this.sortedDetectors.map((detector) => detector.getMetadata());
  }

  /**
   * Get detector count
   */
  getDetectorCount(): number {
    return this.detectors.size;
  }

  /**
   * Check if a detector is registered for a framework type
   */
  hasDetector(frameworkType: FrameworkType): boolean {
    const key = this.getDetectorKey({ frameworkType } as IFrameworkMetadata);
    return this.detectors.has(key);
  }

  /**
   * Get detectors by category
   */
  getDetectorsByCategory(
    category: 'frontend' | 'backend' | 'fullstack' | 'static' | 'passthrough',
  ): IFrameworkDetector[] {
    return this.sortedDetectors.filter(
      (detector) => detector.getMetadata().category === category,
    );
  }

  /**
   * Get official detectors only
   */
  getOfficialDetectors(): IFrameworkDetector[] {
    return this.sortedDetectors.filter(
      (detector) => detector.getMetadata().official === true,
    );
  }

  /**
   * Module initialization - discover detectors
   */
  async onModuleInit() {
    this.logger.log('Framework Registry initialized');
    this.logger.log(`Registered detectors: ${this.detectors.size}`);

    if (this.detectors.size === 0) {
      this.logger.warn(
        'No framework detectors registered. Detection will not work until detectors are registered.',
      );
    }
  }

  /**
   * Sort detectors by priority (highest first)
   */
  private sortDetectorsByPriority(): void {
    this.sortedDetectors = Array.from(this.detectors.values()).sort((a, b) => {
      const metadataA = a.getMetadata();
      const metadataB = b.getMetadata();

      // Sort by priority (descending)
      if (metadataB.priority !== metadataA.priority) {
        return metadataB.priority - metadataA.priority;
      }

      // If same priority, official detectors first
      if (metadataA.official !== metadataB.official) {
        return metadataA.official ? -1 : 1;
      }

      // If same priority and official status, alphabetical by name
      return metadataA.frameworkType.localeCompare(metadataB.frameworkType);
    });
  }

  /**
   * Generate detector key from metadata
   */
  private getDetectorKey(metadata: IFrameworkMetadata): string {
    return metadata.frameworkType;
  }
}
