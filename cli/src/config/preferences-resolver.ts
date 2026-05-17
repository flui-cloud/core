import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigStorage } from '../lib/config-storage';
import {
  PREFERENCES,
  PreferenceDefinition,
  PreferenceKey,
} from './preferences-schema';

/**
 * Where a resolved preference value came from.
 * Higher in the list = higher priority.
 */
export type PreferenceSource =
  | 'explicit' // value passed in directly (e.g. CLI flag)
  | 'env' // environment variable
  | 'project' // ./flui.config.json in cwd
  | 'user' // ~/.flui/profiles/<active>/config.json (preferences block)
  | 'default' // schema default
  | 'missing'; // nothing provided — caller must prompt or fail

export interface ResolvedPreference<T = unknown> {
  key: PreferenceKey;
  value: T | null;
  source: PreferenceSource;
}

const PROJECT_FILE = 'flui.config.json';

/**
 * Resolves user preferences across all configured layers.
 *
 * Cascade (first hit wins):
 *   explicit value > env var > project-local > user-global (active profile) > default > missing
 *
 * The project-local file may only override keys whose schema declares
 * `projectOverridable: true`. Secret values (tokens, apiKey) are never read here.
 */
export class PreferencesResolver {
  private projectConfigCache: Record<string, unknown> | null | undefined;

  constructor(
    private readonly storage: ConfigStorage = new ConfigStorage(),
    private readonly cwd: string = process.cwd(),
  ) {}

  resolve<T = string>(
    key: PreferenceKey,
    explicit?: T | null | undefined,
  ): ResolvedPreference<T> {
    const def = PREFERENCES[key];

    if (explicit !== undefined && explicit !== null && explicit !== '') {
      return { key, value: explicit, source: 'explicit' };
    }

    const envValue = process.env[def.envVar];
    if (envValue !== undefined && envValue !== '') {
      return { key, value: envValue as unknown as T, source: 'env' };
    }

    if (def.projectOverridable) {
      const projectValue = this.readProjectFile()?.[key];
      if (projectValue !== undefined && projectValue !== '') {
        return { key, value: projectValue as T, source: 'project' };
      }
    }

    const userValue = this.storage.getPreference<T>(key);
    if (userValue !== undefined && userValue !== null && userValue !== '') {
      return { key, value: userValue, source: 'user' };
    }

    if (def.defaultValue !== undefined) {
      return {
        key,
        value: def.defaultValue as unknown as T,
        source: 'default',
      };
    }

    return { key, value: null, source: 'missing' };
  }

  /**
   * Resolve every key declared in the schema. Useful for `flui pref` listing.
   */
  resolveAll(): ResolvedPreference[] {
    return (Object.keys(PREFERENCES) as PreferenceKey[]).map((k) =>
      this.resolve(k),
    );
  }

  /**
   * Validate a candidate value against the schema. Returns null when ok.
   */
  static validate(key: PreferenceKey, value: string): string | null {
    const def: PreferenceDefinition = PREFERENCES[key];
    if (def.allowedValues && !def.allowedValues.includes(value)) {
      return `Allowed values: ${def.allowedValues.join(', ')}`;
    }
    if (def.validate) {
      return def.validate(value);
    }
    return null;
  }

  projectFilePath(): string {
    return join(this.cwd, PROJECT_FILE);
  }

  /**
   * Lazy-load the project-local file once per resolver instance.
   * Returns null when missing or unreadable; throws only on malformed JSON
   * (so config errors don't fail silently).
   */
  private readProjectFile(): Record<string, unknown> | null {
    if (this.projectConfigCache !== undefined) {
      return this.projectConfigCache;
    }
    const path = this.projectFilePath();
    if (!existsSync(path)) {
      this.projectConfigCache = null;
      return null;
    }
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf-8'));
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('expected a JSON object at the root');
      }
      this.projectConfigCache = parsed as Record<string, unknown>;
      return this.projectConfigCache;
    } catch (err) {
      throw new Error(
        `Failed to parse project config ${path}: ${(err as Error).message}`,
      );
    }
  }
}
