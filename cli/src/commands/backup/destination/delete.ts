import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { BackupClient } from '../../../lib/backup-client';
import { confirmPrompt } from '../../../lib/prompts';
import { printContextBanner } from '../../../lib/context-banner';

export default class BackupDestinationDelete extends Command {
  static readonly description = 'Delete a backup destination';
  static readonly args = {
    id: Args.string({ required: true, description: 'Destination ID' }),
  };
  static readonly flags = {
    yes: Flags.boolean({
      char: 'y',
      description: 'Skip confirmation',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(BackupDestinationDelete);
    printContextBanner();
    const client = BackupClient.fromConfig();

    if (!flags.yes) {
      const ok = await confirmPrompt(
        chalk.yellow(
          `Delete destination ${args.id}? Existing artifacts at the bucket are NOT removed.`,
        ),
        false,
      );
      if (!ok) {
        this.log(chalk.green('Cancelled'));
        return;
      }
    }

    const spinner = ora('Deleting destination...').start();
    try {
      await client.deleteDestination(args.id);
      spinner.succeed(`Deleted ${args.id}`);
    } catch (err) {
      spinner.fail(`Delete failed: ${(err as Error).message}`);
      this.exit(1);
    }
  }
}
