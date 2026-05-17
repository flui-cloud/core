import { FrameworkType, BuildMode } from '../enums';

/**
 * Result of framework detection
 */
export interface IDetectionResult {
  /**
   * Detected framework type
   */
  framework: FrameworkType;

  /**
   * Confidence score (0-100)
   */
  confidence: number;

  /**
   * Framework version detected (e.g., "14.2.3")
   */
  version?: string;

  /**
   * Major version for template selection (e.g., "14")
   */
  majorVersion?: string;

  /**
   * Build mode detected
   */
  buildMode?: BuildMode;

  /**
   * Detected features
   */
  features?: string[];

  /**
   * Package manager detected
   */
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  /**
   * Node.js version requirement
   */
  nodeVersion?: string;

  /**
   * Warnings found during detection
   */
  warnings?: string[];

  /**
   * Validation errors (non-blocking)
   */
  validationErrors?: string[];

  /**
   * Additional metadata from detector
   */
  metadata?: Record<string, any>;

  /**
   * Name of detector that produced this result
   */
  detectorName: string;
}
