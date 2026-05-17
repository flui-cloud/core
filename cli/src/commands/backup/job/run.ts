import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

export default class BackupJobRun extends Command {
  static readonly description =
    'Trigger an on-demand backup job for a given policy';
  static readonly flags = {
    policy: Flags.string({ required: true, description: 'Policy ID' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(BackupJobRun);
    printContextBanner();
    const client = BackupClient.fromConfig();
    const spinner = ora('Queuing backup job...').start();
    try {
      const job = await client.runJobForPolicy(flags.policy);
      spinner.succeed(
        `Queued job ${chalk.cyan(job.id)} (status=${job.status})`,
      );
      this.log(chalk.dim(`   Track with: flui backup job show ${job.id}`));
    } catch (err) {
      spinner.fail(`Run failed: ${(err as Error).message}`);
      this.exit(1);
    }
  }
}
