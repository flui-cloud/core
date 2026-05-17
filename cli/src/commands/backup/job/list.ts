import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

export default class BackupJobList extends Command {
  static readonly description = 'List backup jobs for a cluster';
  static readonly flags = {
    cluster: Flags.string({ required: true, description: 'Cluster ID' }),
    json: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(BackupJobList);
    printContextBanner();
    const client = BackupClient.fromConfig();
    const items = await client.listJobsForCluster(flags.cluster);
    if (flags.json) {
      this.log(JSON.stringify(items, null, 2));
      return;
    }
    if (items.length === 0) {
      this.log(chalk.yellow('\n   No jobs.\n'));
      return;
    }
    this.log('');
    for (const j of items) {
      this.log(
        `   ${chalk.cyan(j.id)}  ${j.status}  policy=${j.policyId}` +
          (j.startedAt ? ` started=${j.startedAt}` : '') +
          (j.completedAt ? ` done=${j.completedAt}` : ''),
      );
    }
    this.log('');
  }
}
