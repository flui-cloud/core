/**
 * Schema for user preferences resolved by the layered config system.
 *
 * Each entry declares everything the resolver needs:
 * - where the value can come from (project file, env var, prompt),
 * - how to validate it,
 * - how to describe it to the user.
 *
 * Add a new preference here, then any command can consume it via
 * `PreferencesResolver.resolve(key)` without touching command-specific flag wiring.
 */

export type PreferenceKey =
  | 'email'
  | 'apiPath'
  | 'dashboardPath'
  | 'certificateMode';

export interface PreferenceDefinition<T = string> {
  /** Stable key — also used as JSON key in storage. */
  key: PreferenceKey;
  /** One-line human description shown in `flui pref` output and prompts. */
  description: string;
  /** Environment variable that overrides storage. */
  envVar: string;
  /** When true, project-local ./flui.config.json may override the user-global value. */
  projectOverridable: boolean;
  /** Default applied if no source provides a value (lowest priority). */
  defaultValue?: T;
  /** When true, the resolver requires a value and will prompt / fail if missing. */
  required: boolean;
  /** Optional enum of allowed values. */
  allowedValues?: readonly T[];
  /** Validator returning an error message or null when valid. */
  validate?: (value: string) => string | null;
}

export const PREFERENCES: Record<PreferenceKey, PreferenceDefinition> = {
  email: {
    key: 'email',
    description: 'Contact email used for ACME/Let\'s Encrypt and operational notifications',
    envVar: 'FLUI_EMAIL',
    projectOverridable: true,
    required: true,
    validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Not a valid email'),
  },
  apiPath: {
    key: 'apiPath',
    description:
      'Path to the flui.api repo, used to locate the .env file written by env export-config',
    envVar: 'FLUI_API_PATH',
    projectOverridable: true,
    defaultValue: '.',
    required: false,
  },
  dashboardPath: {
    key: 'dashboardPath',
    description: 'Path to the flui.dashboard repo, used when syncing its config.json',
    envVar: 'FLUI_DASHBOARD_PATH',
    projectOverridable: true,
    defaultValue: '../flui.dashboard',
    required: false,
  },
  certificateMode: {
    key: 'certificateMode',
    description: 'Certificate issuance policy written into the dashboard config',
    envVar: 'FLUI_CERTIFICATE_MODE',
    projectOverridable: true,
    defaultValue: 'production',
    required: false,
    allowedValues: ['staging', 'preflight', 'production'] as const,
  },
};

export function isPreferenceKey(value: string): value is PreferenceKey {
  return value in PREFERENCES;
}
