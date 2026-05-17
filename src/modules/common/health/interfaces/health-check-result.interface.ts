export interface HealthCheckResult {
  success: boolean;
  service: string;
  error?: string;
  details?: Record<string, any>;
}

export interface StartupCheckResult {
  success: boolean;
  checks: HealthCheckResult[];
  errorMessage?: string;
}
