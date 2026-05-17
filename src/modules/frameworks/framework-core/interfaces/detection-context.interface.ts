/**
 * Context provided to framework detectors containing repository information
 */
export interface IDetectionContext {
  /**
   * Absolute path to cloned repository
   */
  repositoryPath: string;

  /**
   * List of all files in repository (relative paths)
   */
  files: string[];

  /**
   * Repository root files (for quick checks)
   */
  rootFiles: string[];

  /**
   * Parsed package.json content (if exists)
   */
  packageJson?: {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
    engines?: {
      node?: string;
      npm?: string;
    };
    [key: string]: any;
  };

  /**
   * User-provided configuration from .flui.yaml (if exists)
   */
  fluiConfig?: IFluiConfig;

  /**
   * Detected package manager
   */
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  /**
   * Lockfile present
   */
  lockfilePresent: boolean;

  /**
   * Lockfile name (if present)
   */
  lockfileName?: string;

  /**
   * Node version from .nvmrc (if exists)
   */
  nodeVersion?: string;

  /**
   * Has CI configuration (.github/workflows, .gitlab-ci.yml, etc.)
   */
  hasCIConfig: boolean;

  /**
   * Has test scripts configured
   */
  hasTests: boolean;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * User configuration from .flui.yaml
 */
export interface IFluiConfig {
  version: string;

  framework?: {
    name?: string;
    version?: string;
    mode?: string;
  };

  build?: {
    command?: string;
    outputDir?: string;
    dockerfile?: string;
    args?: Record<string, string>;
    env?: Array<{ name: string; value: string }>;
    strategy?: string;
    buildCommand?: string;
    startCommand?: string;
  };

  runtime?: {
    port?: number;
    protocol?: 'http' | 'https';
    env?: Array<{ name: string; value: string }>;
    healthCheck?: {
      enabled: boolean;
      path?: string;
      port?: number;
      initialDelaySeconds?: number;
      periodSeconds?: number;
      timeoutSeconds?: number;
      successThreshold?: number;
      failureThreshold?: number;
    };
  };

  resources?: {
    cpu?: {
      request?: string;
      limit?: string;
    };
    memory?: {
      request?: string;
      limit?: string;
    };
  };

  scaling?: {
    enabled?: boolean;
    minReplicas?: number;
    maxReplicas?: number;
    targetCPUUtilization?: number;
    targetMemoryUtilization?: number;
  };

  [key: string]: any;
}
