import chalk from 'chalk';
import { PREFERENCES } from './preferences-schema';
import { PreferencesResolver, ResolvedPreference } from './preferences-resolver';

const SOURCE_LABELS: Record<ResolvedPreference['source'], string> = {
  explicit: 'flag',
  env: 'env',
  project: 'project',
  user: 'user',
  default: 'default',
  missing: 'missing',
};

/**
 * Print resolved preferences (key, value, source) before a command performs work,
 * so users always see what's about to be applied.
 *
 * Pass only the keys actually consumed by the command — not every preference in the schema —
 * to keep the output focused.
 */
export function echoPreferences(
  resolved: ResolvedPreference[],
  resolver: PreferencesResolver,
): void {
  if (resolved.length === 0) return;

  const keyWidth = Math.max(...resolved.map((r) => String(r.key).length));
  const valueWidth = Math.max(
    ...resolved.map((r) => formatValue(r.value).length),
  );

  console.log(chalk.cyan('\nConfiguration in use:'));
  for (const r of resolved) {
    const def = PREFERENCES[r.key];
    const valStr = formatValue(r.value);
    const sourceStr = formatSource(r);
    console.log(
      `  ${chalk.bold(r.key.padEnd(keyWidth))}  ${valStr.padEnd(valueWidth)}  ${sourceStr}  ${chalk.dim(def.description)}`,
    );
  }
  if (resolved.some((r) => r.source === 'project')) {
    console.log(chalk.dim(`  ↳ project file: ${resolver.projectFilePath()}`));
  }
  console.log();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return chalk.yellow('<unset>');
  return String(value);
}

function formatSource(r: ResolvedPreference): string {
  const label = SOURCE_LABELS[r.source];
  switch (r.source) {
    case 'explicit':
    case 'env':
      return chalk.green(`(${label})`);
    case 'project':
      return chalk.cyan(`(${label})`);
    case 'user':
      return chalk.blue(`(${label})`);
    case 'default':
      return chalk.dim(`(${label})`);
    case 'missing':
      return chalk.red(`(${label})`);
  }
}
