import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

export default class BackupDestinationList extends Command {
  static readonly description =
    'List backup destinations configured in the API';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  static readonly flags = {
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(BackupDestinationList);
    printContextBanner();
    const client = BackupClient.fromConfig();
    const items = await client.listDestinations();

    if (flags.json) {
      this.log(JSON.stringify(items, null, 2));
      return;
    }

    if (items.length === 0) {
      this.log(chalk.yellow('\n   No backup destinations configured.\n'));
      this.log(
        chalk.dim(
          '   Create one with: flui backup destination create --help\n',
        ),
      );
      return;
    }

    this.log('');
    for (const d of items) {
      const usage = d.usageBytes
        ? ` · ${(d.usageBytes / 1024 ** 3).toFixed(2)} GB`
        : '';
      const health = d.health ? chalk.dim(` [${d.health}]`) : '';
      this.log(
        `   ${chalk.cyan(d.id)}  ${chalk.bold(d.name)}  ${d.provider}  ` +
          `${d.region}/${d.bucket}${usage}${health}`,
      );
    }
    this.log('');
  }
}
