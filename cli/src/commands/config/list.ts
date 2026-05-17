import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { ConfigStorage } from '../../lib/config-storage';
import { PreferencesResolver } from '../../config/preferences-resolver';
import { echoPreferences } from '../../config/preferences-echo';

export default class ConfigList extends Command {
  static readonly description =
    'List configured provider tokens and resolved preferences (with their source).';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --tokens',
    '<%= config.bin %> <%= command.id %> --preferences',
    '<%= config.bin %> <%= command.id %> --verbose',
  ];

  static readonly flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed information including timestamps',
      default: false,
    }),
    tokens: Flags.boolean({
      description: 'Show only provider tokens',
      default: false,
    }),
    preferences: Flags.boolean({
      description: 'Show only resolved preferences',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigList);
    const showAll = !flags.tokens && !flags.preferences;

    try {
      const storage = new ConfigStorage();

      if (flags.tokens || showAll) {
        this.printTokens(storage, flags.verbose);
      }

      if (flags.preferences || showAll) {
        this.printPreferences(storage);
      }

      console.log(chalk.gray(`Storage: ${storage.getConfigPath()}`));
      console.log(chalk.gray('Encryption: AES-256-GCM (tokens only)\n'));
    } catch (error) {
      console.log(chalk.red('\nFailed to list configuration'));
      console.log(
        chalk.gray(
          `Error: ${error instanceof Error ? error.message : String(error)}\n`,
        ),
      );
      this.exit(1);
    }
  }

  private printTokens(storage: ConfigStorage, verbose: boolean): void {
    const providers = storage.listProviders();
    if (providers.length === 0) {
      console.log(chalk.yellow('\nNo provider tokens configured'));
      console.log(
        chalk.gray('Configure one: flui config set <provider> <token>'),
      );
      return;
    }

    console.log(chalk.green(`\nProvider tokens (${providers.length}):\n`));
    for (const provider of providers) {
      const meta = storage.getTokenMetadata(provider);
      if (!meta) {
        console.log(
          `  ${chalk.red('✗')} ${provider} ${chalk.gray('(no metadata)')}`,
        );
        continue;
      }
      const updatedAgo = this.getTimeAgo(new Date(), new Date(meta.updatedAt));
      console.log(`  ${chalk.green('✓')} ${chalk.bold(provider)}`);
      if (verbose) {
        console.log(
          chalk.gray(
            `    Created: ${this.formatDate(new Date(meta.createdAt))}`,
          ),
        );
        console.log(
          chalk.gray(
            `    Updated: ${this.formatDate(new Date(meta.updatedAt))} (${updatedAgo})`,
          ),
        );
      } else {
        console.log(chalk.gray(`    Configured ${updatedAgo}`));
      }
    }
  }

  private printPreferences(storage: ConfigStorage): void {
    const resolver = new PreferencesResolver(storage);
    echoPreferences(resolver.resolveAll(), resolver);
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getTimeAgo(now: Date, past: Date): string {
    const diffMs = now.getTime() - past.getTime();
    const minutes = Math.floor(diffMs / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}
