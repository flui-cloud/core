import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

export default class BackupPolicyShow extends Command {
  static readonly description = 'Show a backup policy by ID';
  static readonly args = {
    id: Args.string({ required: true, description: 'Policy ID' }),
  };
  static readonly flags = { json: Flags.boolean({ default: false }) };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(BackupPolicyShow);
    printContextBanner();
    const client = BackupClient.fromConfig();
    const p = await client.getPolicy(args.id);
    if (flags.json) {
      this.log(JSON.stringify(p, null, 2));
      return;
    }
    this.log('');
    this.log(`   ${chalk.bold('ID:')}        ${p.id}`);
    this.log(`   ${chalk.bold('Name:')}      ${p.name}`);
    this.log(`   ${chalk.bold('Cluster:')}   ${p.clusterId}`);
    this.log(`   ${chalk.bold('Profile:')}   ${p.profile}`);
    this.log(`   ${chalk.bold('Scope:')}     ${p.scope}`);
    if (p.schedule) this.log(`   ${chalk.bold('Schedule:')}  ${p.schedule}`);
    if (typeof p.retentionDays === 'number')
      this.log(`   ${chalk.bold('Retention:')} ${p.retentionDays} days`);
    if (p.destinations?.length) {
      this.log(`   ${chalk.bold('Destinations:')}`);
      for (const d of p.destinations) {
        const prio = d.priority == null ? '' : ` prio=${d.priority}`;
        this.log(`     - ${d.destinationId} (${d.role}${prio})`);
      }
    }
    this.log('');
  }
}
