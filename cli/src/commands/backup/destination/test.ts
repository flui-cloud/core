import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

export default class BackupDestinationTest extends Command {
  static readonly description =
    'Test connectivity to a backup destination (S3 PUT/GET/DELETE round-trip)';
  static readonly args = {
    id: Args.string({ required: true, description: 'Destination ID' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(BackupDestinationTest);
    printContextBanner();
    const client = BackupClient.fromConfig();
    const spinner = ora(`Testing destination ${args.id}...`).start();
    try {
      const res = await client.testDestination(args.id);
      if (res.healthy) {
        spinner.succeed('Destination reachable');
      } else {
        const suffix = res.error ? ` — ${res.error}` : '';
        spinner.fail(`Test failed${suffix}`);
        this.exit(1);
      }
    } catch (err) {
      spinner.fail(`Test failed: ${(err as Error).message}`);
      this.exit(1);
    }
    void chalk;
  }
}
