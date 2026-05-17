import { Command, Args } from '@oclif/core';
import chalk from 'chalk';
import { ConfigStorage } from '../../lib/config-storage';
import { classifyKey, formatKnownKeys } from '../../config/key-router';
import { PreferencesResolver } from '../../config/preferences-resolver';
import { PreferenceKey } from '../../config/preferences-schema';

export default class ConfigGet extends Command {
  static readonly description =
    'Print the resolved value of a preference (and the layer it came from). Provider tokens are not printable for security — use `flui config list` to see which providers are configured.';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> email',
    '<%= config.bin %> <%= command.id %> certificateMode',
  ];

  static readonly args = {
    key: Args.string({
      required: true,
      description: 'Preference key',
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigGet);
    const kind = classifyKey(args.key);

    if (kind === 'provider') {
      console.log(
        chalk.yellow(
          `\n'${args.key}' is a provider token; tokens are encrypted and not printable.`,
        ),
      );
      console.log(chalk.gray('Use `flui config list --tokens` instead.\n'));
      return;
    }

    if (kind === 'unknown') {
      console.log(chalk.red(`\nUnknown configuration key: '${args.key}'\n`));
      console.log(formatKnownKeys());
      console.log();
      this.exit(1);
    }

    const resolver = new PreferencesResolver(new ConfigStorage());
    const resolved = resolver.resolve(args.key as PreferenceKey);

    if (resolved.value === null) {
      console.log(
        chalk.yellow(`\n'${args.key}' is not set (no value at any layer)\n`),
      );
      return;
    }

    const sourceLabel = chalk.dim(`(source: ${resolved.source})`);
    console.log(`${chalk.bold(args.key)} = ${resolved.value}  ${sourceLabel}`);
  }
}
