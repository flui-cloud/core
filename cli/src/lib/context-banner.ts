import chalk from 'chalk';
import { ProfileManager } from './profile-manager';
import { ConfigStorage } from './config-storage';

export interface ContextBannerOptions {
  /** Optional override of the API URL display (e.g. when caller already loaded ConfigStorage). */
  apiUrl?: string | null;
  /** Optional cluster provider/region pair to show inline. */
  cluster?: { provider?: string; region?: string };
  /** Print a trailing blank line. Default true. */
  trailingNewline?: boolean;
}

export function printContextBanner(opts: ContextBannerOptions = {}): void {
  const profile = ProfileManager.getActiveProfile();
  const apiUrl = opts.apiUrl ?? new ConfigStorage().getApiUrl();
  const apiDisplay = apiUrl ? chalk.dim(apiUrl) : chalk.yellow('(not set)');

  const parts: string[] = [
    `${chalk.bold('context')} ${chalk.cyan(profile)}`,
    `${chalk.bold('api')} ${apiDisplay}`,
  ];

  if (opts.cluster?.provider) {
    const region = opts.cluster.region ? `/${opts.cluster.region}` : '';
    parts.push(
      `${chalk.bold('cluster')} ${chalk.cyan(opts.cluster.provider + region)}`,
    );
  }

  console.log(chalk.dim('┌─ ') + parts.join(chalk.dim(' · ')));
  if (opts.trailingNewline !== false) console.log('');
}
