import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import {
  ReconciliationService,
  ReconciliationType,
  ReconciliationResult,
} from '../lib/services/reconciliation.service';
import { ConfigStorage } from '../lib/config-storage';
import { buildNipBaseDomain } from '../lib/nip-base-domain.util';
import { CliClusterRepository } from '../lib/repositories/cli-cluster.repository';

export default class Reconcile extends Command {
  static readonly description =
    'Reconcile CLI state with API (DNS configuration)';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --type dns',
    '<%= config.bin %> <%= command.id %> --dry-run',
  ];

  static readonly flags = {
    type: Flags.string({
      char: 't',
      description: 'Reconciliation type(s) to execute (default: all)',
      options: ['dns', 'all'],
      multiple: true,
      default: ['all'],
    }),
    'api-url': Flags.string({
      description:
        'Flui API URL (default: from config or http://localhost:3000/api/v1)',
      required: false,
    }),
    'dry-run': Flags.boolean({
      description: 'Show what would be reconciled without making changes',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Reconcile);

    let spinner = ora('Initializing reconciliation...').start();

    try {
      const configStorage = new ConfigStorage();
      let apiUrl = flags['api-url'] || configStorage.getApiUrl();

      if (!flags['api-url'] && !apiUrl) {
        const clusterRepo = new CliClusterRepository();
        const cluster = await clusterRepo.findOne({
          where: { metadata: { isObservabilityCluster: true } },
        });

        if (cluster?.masterIpAddress) {
          const base = buildNipBaseDomain(
            cluster.masterIpAddress,
            cluster.nipHostnameToken,
          );
          apiUrl = `https://api.${base}/api/v1`;
          configStorage.saveApiUrl(apiUrl);
          spinner.text = `Auto-detected API URL: ${apiUrl}`;
        }
      }

      if (!apiUrl) {
        spinner.fail('API URL is not configured for this context');
        console.log(
          chalk.yellow(
            '\nRun `flui env create` to provision a cluster, or set it manually:\n  flui config set api-url https://api.example.com/api/v1\n',
          ),
        );
        this.exit(1);
      }

      spinner.text = 'Connecting to API...';

      // Parse reconciliation types
      const types = flags.type.map(
        (t) => t.toLowerCase() as ReconciliationType,
      );

      // Dry run mode
      if (flags['dry-run']) {
        spinner.succeed('Connected to API');
        console.log(
          chalk.cyan('\n🔍 Dry Run Mode - No changes will be made\n'),
        );
        console.log(chalk.dim(`   API URL: ${apiUrl}`));
        console.log(
          chalk.dim(
            `   Types: ${types.includes(ReconciliationType.ALL) ? 'all (dns)' : types.join(', ')}`,
          ),
        );
        console.log('');
      }

      spinner.text = 'Starting reconciliation...';

      // Execute reconciliation
      const reconciliationService = new ReconciliationService(apiUrl);
      const { results, allSuccess } = await reconciliationService.reconcile({
        types,
        dryRun: flags['dry-run'],
        apiUrl,
      });

      spinner.stop();

      // Save reconciliation state to cluster metadata (skip for dry-run)
      if (!flags['dry-run']) {
        try {
          const clusterRepo = new CliClusterRepository();
          const cluster = await clusterRepo.findOne({
            where: { metadata: { isObservabilityCluster: true } },
          });
          if (cluster) {
            cluster.metadata = {
              ...cluster.metadata,
              reconciliation: {
                status: allSuccess ? 'completed' : 'partial',
                completedAt: new Date().toISOString(),
                results: results.map((r) => ({
                  type: r.type,
                  success: r.success,
                  message: r.message,
                })),
              },
            };
            await clusterRepo.save(cluster);
          }
        } catch {
          // Ignore metadata save errors
        }
      }

      // Display results
      this.displayResults(results, flags['dry-run']);

      // Exit with appropriate code
      if (allSuccess) {
        console.log(
          chalk.green(
            `\n✓ All reconciliations ${flags['dry-run'] ? 'would complete' : 'completed'} successfully!\n`,
          ),
        );
      } else {
        console.log(
          chalk.yellow(
            `\n⚠ Some reconciliations ${flags['dry-run'] ? 'would fail' : 'failed'}. See details above.\n`,
          ),
        );
        this.exit(1);
      }
    } catch (error: any) {
      spinner.fail('Reconciliation failed');
      console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
      if (error.stack) {
        console.log(chalk.dim(error.stack));
      }
      this.exit(1);
    }
  }

  /**
   * Display reconciliation results
   */
  private displayResults(
    results: ReconciliationResult[],
    dryRun: boolean,
  ): void {
    console.log(
      chalk.bold(
        `\n${dryRun ? '🔍 Reconciliation Preview' : '📊 Reconciliation Results'}`,
      ),
    );
    console.log(chalk.dim('─'.repeat(60)));

    for (const result of results) {
      const icon = result.success ? '✓' : '✗';
      const color = result.success ? chalk.green : chalk.red;
      const typeLabel = this.formatTypeLabel(result.type);

      console.log(color(`\n${icon} ${typeLabel}`));
      console.log(chalk.dim(`   ${result.message}`));

      if (result.details) {
        console.log(chalk.dim('   Details:'));
        if (Array.isArray(result.details)) {
          for (const detail of result.details) {
            const detailIcon = detail.success ? '  ✓' : '  ✗';
            const detailColor = detail.success ? chalk.green : chalk.yellow;
            console.log(detailColor(`   ${detailIcon} ${detail.message}`));
          }
        } else {
          for (const [key, value] of Object.entries(result.details)) {
            console.log(chalk.dim(`     ${key}: ${value}`));
          }
        }
      }

      if (result.error && !result.success) {
        console.log(chalk.red(`   Error: ${result.error}`));
      }
    }

    console.log(chalk.dim('\n' + '─'.repeat(60)));
  }

  /**
   * Format reconciliation type label
   */
  private formatTypeLabel(type: ReconciliationType): string {
    const labels: Record<ReconciliationType, string> = {
      [ReconciliationType.DNS]: 'DNS Configuration',
      [ReconciliationType.ALL]: 'All Resources',
    };

    return labels[type] || type;
  }
}
