import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { CliAppService } from '../../lib/services/cli-app.service';
import { resolveCluster } from '../../lib/resolve-cluster';

export default class AppList extends Command {
  static readonly description = 'List all applications in the cluster';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --output json',
  ];

  static readonly flags = {
    cluster: Flags.string({
      char: 'c',
      description:
        'Cluster name or ID (default: auto-detect when only one cluster exists)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output format',
      options: ['table', 'json'],
      default: 'table',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AppList);
    const spinner = ora('Fetching applications...').start();

    try {
      const { id: clusterId } = await resolveCluster(flags.cluster);
      const service = await CliAppService.create(clusterId);
      const apps = await service.listApps();

      spinner.stop();

      if (flags.output === 'json') {
        console.log(JSON.stringify(apps, null, 2));
        return;
      }

      if (apps.length === 0) {
        console.log(
          chalk.yellow('\n  No applications found in this cluster.\n'),
        );
        return;
      }

      console.log(chalk.cyan('\n  Applications\n'));
      console.log(
        chalk.dim(
          `  ${'NAME'.padEnd(28)} ${'STATUS'.padEnd(14)} ${'REPLICAS'.padEnd(10)} ${'KIND'.padEnd(14)} ${'EXPOSURE'.padEnd(10)} LAST DEPLOY`,
        ),
      );
      console.log(chalk.dim('  ' + '─'.repeat(90)));

      for (const app of apps) {
        const name =
          app.name.length > 26 ? app.name.slice(0, 25) + '…' : app.name;
        const kind = (app.kind || '').toLowerCase();
        const exposure = (app.exposure || '').toLowerCase();
        const replicas = String(app.replicas ?? '-');
        const lastDeploy = app.lastDeployedAt
          ? new Date(app.lastDeployedAt).toLocaleString()
          : chalk.dim('never');

        // Pad before coloring so escape codes don't break column widths
        const statusPadded = app.status.padEnd(14);
        const coloredStatus = this.colorStatus(statusPadded);

        console.log(
          `  ${name.padEnd(28)} ${coloredStatus} ${replicas.padEnd(10)} ${kind.padEnd(14)} ${exposure.padEnd(10)} ${lastDeploy}`,
        );
      }

      console.log('');
      console.log(
        chalk.dim(`  ${apps.length} app${apps.length === 1 ? '' : 's'} total`),
      );
      console.log('');
    } catch (error: any) {
      spinner.fail('Failed to fetch applications');
      console.log(chalk.red(`\n  Error: ${error.message}\n`));
      this.exit(1);
    }
  }

  private colorStatus(status: string): string {
    const s = status.trim().toLowerCase();
    if (s === 'running') return chalk.green(status);
    if (s === 'stopped') return chalk.yellow(status);
    if (s === 'failed' || s === 'degraded') return chalk.red(status);
    if (s === 'provisioning' || s === 'updating') return chalk.blue(status);
    return chalk.dim(status);
  }
}
