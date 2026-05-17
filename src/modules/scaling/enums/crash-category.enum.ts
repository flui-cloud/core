export enum CrashCategory {
  OOM_KILLED = 'oom_killed',
  CRASH_LOOP = 'crash_loop',
  CONFIG_ERROR = 'config_error',
  IMAGE_PULL_ERROR = 'image_pull_error',
  PROBE_FAILURE = 'probe_failure',
  UNSCHEDULABLE = 'unschedulable',
  UNKNOWN = 'unknown',
}
