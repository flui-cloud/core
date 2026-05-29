import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { buildNipBaseDomain } from '../../lib/nip-base-domain.util';
import { CliControlClusterService } from '../../services/cli-control-cluster.service';
import { CliClusterRepository } from '../../lib/repositories/cli-cluster.repository';
import { CliOperationRepository } from '../../lib/repositories/cli-operation.repository';
import { ClusterStatus } from 'src/modules/infrastructure/clusters/entities/cluster.entity';
import { OperationStatus } from 'src/modules/infrastructure/servers/entities/infrastructure-operations.entity';
import * as readline from 'node:readline';
import { printContextBanner } from '../../lib/context-banner';

export default class EnvForceReady extends Command {
  static readonly description =
    'Force control cluster status to READY (use when cluster is working but stuck in ERROR or CREATING state)';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --force',
    '<%= config.bin %> <%= command.id %> --skip-health-checks',
  ];

  static readonly flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
    'skip-health-checks': Flags.boolean({
      description: 'Skip health validation checks (use with caution)',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EnvForceReady);

    printContextBanner();
    let spinner = ora('Initializing...').start();

    try {
      // Bootstrap NestJS and get services
      const app = await getNestApp();
      spinner.stop();

      console.log(chalk.yellow('\n⚠️  Force Cluster Status to READY\n'));

      spinner = ora('Loading cluster...').start();
      const controlService = app.get(CliControlClusterService);
      const clusterRepository = app.get(CliClusterRepository);
      const operationRepository = app.get(CliOperationRepository);

      // Find control cluster
      const cluster = await controlService.getControlCluster();

      if (!cluster) {
        spinner.fail('No control cluster found');
        console.log(chalk.yellow('\n⚠️  No control cluster exists.\n'));
        console.log(chalk.dim('Create one with:'));
        console.log(`   ${chalk.cyan('flui env create')}\n`);
        return;
      }

      spinner.succeed('Cluster found');

      // Verify cluster is in ERROR or CREATING state
      const allowedStates = [ClusterStatus.ERROR, ClusterStatus.CREATING];
      if (!allowedStates.includes(cluster.status)) {
        spinner.fail(
          `Cluster is not in ERROR or CREATING state (current: ${cluster.status})`,
        );
        console.log(
          chalk.yellow(
            `\n⚠️  This command only works on clusters in ERROR or CREATING state.\n`,
          ),
        );
        console.log(chalk.dim(`   Current status: ${cluster.status}`));
        console.log(chalk.dim(`\nCheck cluster status with:`));
        console.log(`   ${chalk.cyan('flui env status')}\n`);
        return;
      }

      // Display cluster info
      console.log(chalk.cyan('\n📋 Cluster Information:\n'));
      console.log(`   ${chalk.bold('Name:')}       ${cluster.name}`);
      console.log(`   ${chalk.bold('ID:')}         ${cluster.id}`);
      const statusColor =
        cluster.status === ClusterStatus.ERROR ? chalk.red : chalk.yellow;
      console.log(
        `   ${chalk.bold('Status:')}     ${statusColor(cluster.status)}`,
      );
      console.log(`   ${chalk.bold('Master IP:')}  ${cluster.masterIpAddress}`);
      console.log(`   ${chalk.bold('Nodes:')}      ${cluster.nodeCount}`);

      // Health checks (unless skipped)
      let healthStatus: any = null;
      if (!flags['skip-health-checks']) {
        console.log(chalk.cyan('\n🔍 Checking cluster health...\n'));
        spinner = ora('Checking observability services...').start();

        try {
          healthStatus = await controlService.checkObservabilityServices(
            cluster.masterIpAddress,
            cluster.nipHostnameToken,
          );
          spinner.succeed('Health checks completed');

          // Display health status
          console.log(chalk.cyan('\n📊 Service Health Status:\n'));
          console.log(
            `   ${chalk.bold('Prometheus:')}  ${healthStatus.prometheus ? chalk.green('✅ Running') : chalk.red('❌ Down')}`,
          );
          console.log(
            `   ${chalk.bold('Grafana:')}     ${healthStatus.grafana ? chalk.green('✅ Running') : chalk.red('❌ Down')}`,
          );
          console.log(
            `   ${chalk.bold('Loki:')}        ${healthStatus.loki ? chalk.green('✅ Running') : chalk.red('❌ Down')}`,
          );
          console.log(
            `   ${chalk.bold('PostgreSQL:')}  ${healthStatus.postgres ? chalk.green('✅ Running') : chalk.red('❌ Down')}`,
          );
          console.log(
            `   ${chalk.bold('Redis:')}       ${healthStatus.redis ? chalk.green('✅ Running') : chalk.red('❌ Down')}`,
          );
          const allHealthy =
            healthStatus.prometheus &&
            healthStatus.grafana &&
            healthStatus.loki &&
            healthStatus.postgres &&
            healthStatus.redis;

          if (!allHealthy) {
            console.log(
              chalk.yellow(
                '\n⚠️  Some services are not responding. Proceed with caution.',
              ),
            );
          }
        } catch (error) {
          spinner.warn('Health checks failed');
          console.log(
            chalk.yellow(
              `\n⚠️  Could not perform health checks: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
          console.log(
            chalk.yellow(
              '   You can use --skip-health-checks to bypass this check.\n',
            ),
          );
          return;
        }
      } else {
        console.log(
          chalk.yellow('\n⚠️  Health checks skipped (--skip-health-checks)\n'),
        );
      }

      // Confirmation prompt
      console.log(
        chalk.yellow(
          `\n⚠️  This will change the cluster status from ${cluster.status} to READY.\n`,
        ),
      );

      if (!flags.force) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise<string>((resolve) => {
          rl.question(
            chalk.yellow('Force cluster status to READY? (yes/no): '),
            (ans) => {
              rl.close();
              resolve(ans);
            },
          );
        });

        if (answer.toLowerCase() !== 'yes') {
          console.log(chalk.green('\n✅ Operation cancelled\n'));
          return;
        }
      }

      // Update cluster status
      spinner = ora('Updating cluster status...').start();
      cluster.status = ClusterStatus.READY;
      await clusterRepository.save(cluster);
      spinner.succeed('Cluster status updated to READY');

      // Find and update associated failed operation (if exists)
      spinner = ora('Updating operation status...').start();
      const operations = await operationRepository.find({
        where: { resourceId: cluster.id },
      });

      const pendingOperation = operations.find(
        (op) =>
          op.status === OperationStatus.FAILED ||
          op.status === OperationStatus.IN_PROGRESS ||
          op.status === OperationStatus.PENDING,
      );

      if (pendingOperation) {
        pendingOperation.status = OperationStatus.COMPLETED;
        pendingOperation.currentStepIndex = pendingOperation.totalSteps;
        pendingOperation.metadata = {
          ...pendingOperation.metadata,
          forcedReady: true,
          forcedAt: new Date().toISOString(),
          forcedReason: 'Manual override via env:force-ready command',
        };
        await operationRepository.save(pendingOperation);
        spinner.succeed('Operation status updated to COMPLETED');
      } else {
        spinner.info('No pending operation found to update');
      }

      // Success message
      console.log(chalk.green('\n✅ Cluster Status Successfully Updated\n'));
      console.log(
        chalk.dim(`   Cluster is now marked as ${chalk.green('READY')}`),
      );
      console.log(chalk.dim('   You can verify with:'));
      console.log(`   ${chalk.cyan('flui env status')}\n`);

      // Show access info
      console.log(chalk.cyan('📌 Access Information:\n'));
      const baseDomain = buildNipBaseDomain(
        cluster.masterIpAddress,
        cluster.nipHostnameToken,
      );
      console.log(`   ${chalk.bold('Flui Web:')}  https://app.${baseDomain}`);
      console.log(`   ${chalk.bold('Flui API:')}  https://api.${baseDomain}`);
      console.log('');
    } catch (error) {
      spinner.fail('Failed to force cluster status');
      console.log(chalk.red('\n❌ Error:\n'));

      if (error instanceof Error) {
        console.log(`   ${error.message}\n`);

        if (error.stack) {
          console.log(chalk.dim('Stack trace:'));
          console.log(chalk.dim(error.stack));
        }
      } else {
        console.log(`   ${String(error)}\n`);
      }

      this.exit(1);
    } finally {
      await closeNestApp();
    }
  }
}
