import { FrameworkType } from '../enums/framework-type.enum';
import { EnvVarSource, PlaceholderPattern } from '../enums/env-var-source.enum';

export interface IDetectedEnvVar {
  name: string;
  defaultValue?: string;
  sensitive: boolean;
  optional: boolean;
  description?: string;
  source: EnvVarSource;
  /** True for Dockerfile hardcoded values — display only, do not ask user to configure */
  readOnly?: boolean;
  /** Finite set of valid values — frontend renders as <select> instead of free-text input */
  allowedValues?: string[];
}

export interface IEnvVarCandidate {
  vars: IDetectedEnvVar[];
  sourceFile: string;
  detectedPattern?: PlaceholderPattern;
  /**
   * Set when the source file pattern belongs to a framework different from the
   * detected one. Informational only — never overrides the main detection result.
   * Example: detected=DOCKERFILE, file=config.yaml → sourceFrameworkHint=GO
   */
  sourceFrameworkHint?: FrameworkType;
  /**
   * Human-readable group name for this candidate set.
   * Set when candidates correspond to named profiles/environments (e.g. "mysql", "postgres", "Release").
   * Frontend uses this to link a profile-selector var's allowedValues to the matching candidate group.
   */
  label?: string;
}

export interface IEnvVarDetectionResult {
  /**
   * All matching config files found, ranked by hint order.
   * Priority 1 (flui.env) and Priority 4a (Dockerfile) always produce exactly one candidate.
   * Priority 3 (framework config files) can produce multiple — UI lets the user pick.
   */
  candidates: IEnvVarCandidate[];
  isFallback: boolean;
}
