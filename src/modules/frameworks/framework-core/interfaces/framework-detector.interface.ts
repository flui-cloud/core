import { IDetectionContext } from './detection-context.interface';
import { IDetectionResult } from './detection-result.interface';
import { IBuildPlan } from './build-plan.interface';
import { FrameworkType } from '../enums';

/**
 * Metadata about a framework detector
 */
export interface IFrameworkMetadata {
  /**
   * Framework type this detector handles
   */
  frameworkType: FrameworkType;

  /**
   * Display name for framework
   */
  displayName: string;

  /**
   * Detector name (unique identifier)
   */
  detectorName: string;

  /**
   * Detector version
   */
  detectorVersion: string;

  /**
   * Supported framework versions
   */
  supportedVersions: string[];

  /**
   * Priority for detector execution (higher = earlier)
   */
  priority: number;

  /**
   * Category
   */
  category: 'frontend' | 'backend' | 'fullstack' | 'static' | 'passthrough';

  /**
   * Official support or community
   */
  official: boolean;
}

/**
 * Interface that all framework detectors must implement
 */
export interface IFrameworkDetector {
  /**
   * Get metadata about this detector
   */
  getMetadata(): IFrameworkMetadata;

  /**
   * Quick check if this detector can potentially detect the framework
   * Should be fast (<100ms) and only do basic checks
   */
  canDetect(context: IDetectionContext): boolean;

  /**
   * Perform full detection and return result with confidence score
   * Can be slower and do thorough analysis
   */
  detect(context: IDetectionContext): Promise<IDetectionResult>;

  /**
   * Generate build plan from detection result and user config
   */
  generateBuildPlan(
    detectionResult: IDetectionResult,
    context: IDetectionContext,
  ): Promise<IBuildPlan>;

  /**
   * Validate project structure (optional)
   */
  validateProject?(context: IDetectionContext): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;

  /**
   * Suggest optimizations (optional)
   */
  suggestOptimizations?(context: IDetectionContext): Promise<string[]>;

  /**
   * Estimate resource requirements (optional)
   */
  estimateResources?(context: IDetectionContext): Promise<{
    cpu: string;
    memory: string;
    reasoning?: string;
  }>;

  /**
   * Return an ordered list of relative file paths to probe for env var detection.
   * The EnvVarDetectorService iterates this list and produces one candidate per
   * matching file found (Priority 3 in the detection hierarchy).
   * Omit or return [] for frameworks where env vars come from Dockerfile ENV only.
   */
  getEnvFileHints?(): string[];
}
