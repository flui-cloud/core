import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

const SCOPES = [
  'cluster_all',
  'namespaces',
  'applications',
  'label_selector',
] as const;
const PROFILES = ['single', 'mirrored', 'custom'] as const;

export default class BackupPolicyCreate extends Command {
  static readonly description = 'Create a backup policy';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> --name daily-all --cluster <id> --scope cluster_all --schedule "0 2 * * *" --retention-days 14 --destination <destId>',
    '<%= config.bin %> <%= command.id %> --name app-snap --cluster <id> --scope applications --scope-namespaces ns1,ns2 --destination <destId>',
  ];

  static readonly flags = {
    name: Flags.string({ required: true }),
    cluster: Flags.string({ required: true, description: 'Cluster ID' }),
    scope: Flags.string({ required: true, options: [...SCOPES] }),
    'scope-namespaces': Flags.string({
      description: 'Comma-separated namespaces (for scope=namespaces)',
    }),
    'scope-apps': Flags.string({
      description: 'Comma-separated application IDs (for scope=applications)',
    }),
    profile: Flags.string({
      options: [...PROFILES],
      default: 'single',
    }),
    schedule: Flags.string({
      description: 'Cron schedule (e.g. "0 2 * * *" for daily 02:00 UTC)',
    }),
    'retention-days': Flags.integer({ min: 1, default: 30 }),
    'retention-max-copies': Flags.integer({ min: 1 }),
    'include-pvcs': Flags.boolean(),
    'include-etcd-l1': Flags.boolean(),
    enabled: Flags.boolean({ default: true, allowNo: true }),
    destination: Flags.string({
      required: true,
      multiple: true,
      description:
        'Destination spec: <destId>[:primary|replica[:priority]] (repeatable)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(BackupPolicyCreate);
    printContextBanner();

    const destinations = flags.destination.map((spec) => {
      const [id, role = 'primary', prio] = spec.split(':');
      return {
        destinationId: id,
        role: role as 'primary' | 'replica',
        ...(prio ? { priority: Number.parseInt(prio, 10) } : {}),
      };
    });

    let scopeSelector: Record<string, any> | undefined;
    if (flags['scope-namespaces']) {
      scopeSelector = {
        namespaces: flags['scope-namespaces'].split(',').map((s) => s.trim()),
      };
    } else if (flags['scope-apps']) {
      scopeSelector = {
        applicationIds: flags['scope-apps'].split(',').map((s) => s.trim()),
      };
    }

    const client = BackupClient.fromConfig();
    const spinner = ora('Creating policy...').start();
    try {
      const p = await client.createPolicy({
        name: flags.name,
        clusterId: flags.cluster,
        scope: flags.scope,
        profile: flags.profile,
        schedule: flags.schedule,
        retentionDays: flags['retention-days'],
        retentionMaxCopies: flags['retention-max-copies'],
        enabled: flags.enabled,
        destinations,
        scopeSelector,
      });
      spinner.succeed(`Created policy ${chalk.cyan(p.id)}`);
    } catch (err) {
      spinner.fail(`Create failed: ${(err as Error).message}`);
      this.exit(1);
    }
  }
}
