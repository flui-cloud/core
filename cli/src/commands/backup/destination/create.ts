import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { BackupClient } from '../../../lib/backup-client';
import { printContextBanner } from '../../../lib/context-banner';

const PROVIDERS = [
  'hetzner_object_storage',
  'scaleway_object_storage',
  'minio',
  'generic_s3',
] as const;
const ENCRYPTION_MODES = ['flui_managed', 'byo_passphrase', 'none'] as const;

export default class BackupDestinationCreate extends Command {
  static readonly description =
    'Create a backup destination (S3-compatible storage target for Velero)';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> --name my-s3 --provider hetzner_object_storage --endpoint https://fsn1.your-objectstorage.com --region fsn1 --bucket flui-backups --access-key AK --secret-key SK',
    '<%= config.bin %> <%= command.id %> --name scw --provider scaleway_object_storage --endpoint https://s3.fr-par.scw.cloud --region fr-par --bucket flui-bkp --access-key AK --secret-key SK',
  ];

  static readonly flags = {
    name: Flags.string({
      required: true,
      description: 'Display name (≤120 chars)',
    }),
    provider: Flags.string({
      required: true,
      options: [...PROVIDERS],
      description: 'Storage backend provider',
    }),
    endpoint: Flags.string({
      required: true,
      description: 'S3 endpoint URL (e.g. https://s3.fr-par.scw.cloud)',
    }),
    region: Flags.string({ required: true }),
    bucket: Flags.string({ required: true }),
    'access-key': Flags.string({ required: true }),
    'secret-key': Flags.string({ required: true }),
    prefix: Flags.string({
      description: 'Optional path prefix inside the bucket',
    }),
    'encryption-mode': Flags.string({
      options: [...ENCRYPTION_MODES],
      description: 'Encryption mode (default: flui_managed)',
    }),
    'encryption-passphrase': Flags.string({
      description: 'Required when --encryption-mode=byo_passphrase',
    }),
    'force-path-style': Flags.boolean({
      description: 'Force path-style S3 URLs (needed for MinIO/some providers)',
    }),
    'use-sse': Flags.boolean({
      description: 'Use server-side encryption (SSE-S3) at the provider',
    }),
    'usable-for-etcd-l1': Flags.boolean({
      description: 'Allow this destination to receive L1 etcd snapshots',
    }),
    'cost-per-gb-month-cents': Flags.integer({
      description:
        'Provider cost in cents/GB·month (used for billing estimate)',
      min: 0,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(BackupDestinationCreate);
    printContextBanner();
    const client = BackupClient.fromConfig();
    const spinner = ora('Creating backup destination...').start();
    try {
      const dest = await client.createDestination({
        name: flags.name,
        provider: flags.provider as any,
        endpoint: flags.endpoint,
        region: flags.region,
        bucket: flags.bucket,
        pathPrefix: flags.prefix,
        accessKey: flags['access-key'],
        secretKey: flags['secret-key'],
        encryptionMode: flags['encryption-mode'] as any,
        encryptionPassphrase: flags['encryption-passphrase'],
        forcePathStyle: flags['force-path-style'],
        useSse: flags['use-sse'],
        usableForEtcdL1: flags['usable-for-etcd-l1'],
        costPerGbMonthCents: flags['cost-per-gb-month-cents'],
      });
      spinner.succeed(`Created destination ${chalk.cyan(dest.id)}`);
      this.log('');
      this.log(`   ${chalk.bold('Name:')}     ${dest.name}`);
      this.log(`   ${chalk.bold('Provider:')} ${dest.provider}`);
      this.log(`   ${chalk.bold('Bucket:')}   ${dest.bucket}`);
      this.log('');
      this.log(
        chalk.dim(`   Test with: flui backup destination test ${dest.id}\n`),
      );
    } catch (err) {
      spinner.fail(`Create failed: ${(err as Error).message}`);
      this.exit(1);
    }
  }
}
