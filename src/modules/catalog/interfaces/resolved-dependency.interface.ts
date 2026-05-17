import { DependencyMode } from '../enums/dependency-mode.enum';

export interface ResolvedDependency {
  alias: string;
  ref: string;
  host: string;
  port?: number;
  env: Record<string, string>;
  applicationId: string;
  mode: DependencyMode;
}

export interface DependencyChoice {
  alias: string;
  mode: DependencyMode;
  existingApplicationId?: string;
}
