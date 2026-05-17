import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { confirmByTypingPrompt } from '../../lib/prompts';
import { HetznerDnsService } from 'src/modules/providers/services/hetzner-dns.service';
import { DnsRecordType } from 'src/modules/providers/interfaces/dns-provider.interface';

export default class DnsCleanup extends Command {
  static readonly description = 'Delete all A records from a Hetzner DNS zone';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> --domain example.com',
    '<%= config.bin %> <%= command.id %> --domain example.com --dry-run',
    '<%= config.bin %> <%= command.id %> --domain example.com --force',
  ];

  static readonly flags = {
    domain: Flags.string({
      required: true,
      description: 'Hetzner DNS zone domain name',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
    'dry-run': Flags.boolean({
      description: 'Preview without deleting',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DnsCleanup);
    let spinner = ora('Looking up zone...').start();

    try {
      const app = await getNestApp();
      const hetznerDns = app.get(HetznerDnsService);

      const zone = await hetznerDns.getZoneByName(flags.domain);
      if (!zone) {
        spinner.fail(`Zone not found: ${flags.domain}`);
        this.exit(1);
      }
      spinner.succeed(`Zone found: ${zone.zoneId}`);

      spinner = ora('Fetching A records...').start();
      const records = await hetznerDns.listRecords(zone.zoneId);
      const aRecords = records.filter((r) => r.type === DnsRecordType.A);
      const rrsetNames = [...new Set(aRecords.map((r) => r.name))];
      spinner.succeed(
        `Found ${aRecords.length} A value(s) across ${rrsetNames.length} RRSet(s)`,
      );

      console.log(chalk.yellow(`\n  Zone:           ${flags.domain}`));
      console.log(chalk.yellow(`  A RRSets:       ${rrsetNames.length}`));
      console.log(chalk.yellow(`  Total A values: ${aRecords.length}\n`));

      for (const name of rrsetNames) {
        const values = aRecords
          .filter((r) => r.name === name)
          .map((r) => r.value);
        console.log(`  ${chalk.bold(name)} → ${values.join(', ')}`);
      }

      if (flags['dry-run']) {
        console.log(chalk.green('\n  Dry run complete. No records deleted.\n'));
        return;
      }

      if (rrsetNames.length === 0) {
        console.log(chalk.green('\n  No A records found. Nothing to do.\n'));
        return;
      }

      if (!flags.force) {
        console.log('');
        console.log(
          chalk.yellow(
            `  Type 'yes' to delete all ${rrsetNames.length} A RRSet(s) from ${flags.domain}:`,
          ),
        );
        const confirmed = await confirmByTypingPrompt(
          chalk.yellow('Confirm'),
          'yes',
        );
        if (!confirmed) {
          console.log(chalk.green('\n  Deletion cancelled.\n'));
          return;
        }
      }

      spinner = ora('Deleting A records...').start();
      const deleted = await hetznerDns.purgeARecords(zone.zoneId);
      spinner.succeed(`Deleted ${deleted} A RRSet(s)`);

      console.log(
        chalk.green(
          `\n  Cleaned up ${deleted} A RRSet(s) from ${flags.domain}\n`,
        ),
      );
    } catch (error) {
      spinner.fail('DNS cleanup failed');
      console.log(
        chalk.red(
          `\n  ${error instanceof Error ? error.message : String(error)}\n`,
        ),
      );
      this.exit(1);
    } finally {
      await closeNestApp();
    }
  }
}
