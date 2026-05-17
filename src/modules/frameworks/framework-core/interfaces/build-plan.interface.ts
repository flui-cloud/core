import { FrameworkType, BuildMode, DeployStrategy } from '../enums';
import { IEnvVarDetectionResult } from './env-var-detection.interface';
import { AdvisorUserChoice } from './advisor-choice.interface';

/**
 * Complete build plan for deployment
 */
export interface IBuildPlan {
  /**
   * Framework type
   */
  framework: FrameworkType;

  /**
   * Framework version
   */
  version: string;

  /**
   * Build mode
   */
  buildMode?: BuildMode;

  /**
   * Generated or user-provided Dockerfile content
   */
  dockerfile: string;

  /**
   * Build context directory (relative to repo root)
   */
  buildContext: string;

  /**
   * Docker build arguments
   */
  buildArgs?: Record<string, string>;

  /**
   * Environment variables for build
   */
  buildEnv?: Array<{ name: string; value: string }>;

  /**
   * Environment variables for runtime
   */
  runtimeEnv?: Array<{ name: string; value: string }>;

  /**
   * Detected environment variable suggestions from repository analysis.
   * Populated during pre-deploy wizard — always presented as suggestions,
   * never enforced. Only set for source code repos (GIT_BUILD / user Dockerfile).
   */
  envVarSuggestions?: IEnvVarDetectionResult;

  /**
   * Resource requirements
   */
  resources: {
    cpu: {
      request: string;
      limit: string;
    };
    memory: {
      request: string;
      limit: string;
    };
  };

  /**
   * Health check configuration
   */
  healthCheck?: {
    enabled: boolean;
    path: string;
    port: number;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    successThreshold: number;
    failureThreshold: number;
  };

  /**
   * Networking configuration
   */
  networking: {
    port: number;
    protocol: 'http' | 'https';
    ingressEnabled?: boolean;
    domain?: string;
  };

  /**
   * Scaling configuration
   */
  scaling?: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization?: number;
    targetMemoryUtilization?: number;
  };

  /**
   * Metadata about build plan generation
   */
  metadata: {
    detectionConfidence: number;
    templateVersion: string;
    generatedAt: Date;
    userOverrides?: string[];
    warnings?: string[];
  };

  // ── Build Advisor fields ─────────────────────────────────────────────────

  /**
   * Recommended build strategy for this project.
   */
  deployStrategy: DeployStrategy;

  /**
   * Composite deployability score from 0.0 (not deployable) to 1.0 (fully reliable).
   * Threshold for autonomous build (no user confirmation): >= 0.82
   */
  deployabilityScore: number;

  /**
   * Breakdown of individual deployability factors.
   */
  deployabilityFactors: {
    frameworkRecognized: boolean;
    /** Clarity of repo structure (entrypoint, build tool, etc.) */
    repoClarity: number;
    /** How predictable the build artifact output is */
    artifactPredictability: number;
    /** How predictable the runtime start command is */
    runtimePredictability: number;
    /** How reproducible the build is across runs */
    buildReproducibility: number;
  };

  /** Explicit build command to use (for RAILPACK_WITH_OVERRIDES via railway.toml) */
  suggestedBuildCommand?: string;

  /** Explicit start command to use (for RAILPACK_WITH_OVERRIDES via railway.toml) */
  suggestedStartCommand?: string;

  /**
   * Human-readable warnings about the project structure or deployment risks.
   * Surfaced to the user in the UI.
   */
  projectWarnings: string[];

  /**
   * Actionable recommendations for NEEDS_ADJUSTMENT builds.
   * Explains what structural changes are needed before deployment can succeed.
   */
  recommendedStructure?: string[];

  /**
   * When true, the build advisor has detected ambiguous choices that require
   * user confirmation before the build can proceed reliably.
   * When false, the advisor has sufficient confidence to proceed autonomously.
   */
  requiresUserConfirmation: boolean;

  /**
   * Enumerable ambiguous choices that the user must select from.
   * Empty when requiresUserConfirmation = false.
   */
  userChoicesRequired: AdvisorUserChoice[];
}
