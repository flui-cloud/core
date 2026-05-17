import { Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { CliObservabilityClusterService } from '../../services/cli-observability-cluster.service';
import { HetznerProviderService } from 'src/modules/providers/services/hetzner-provider.service';
import { ClusterStatus } from 'src/modules/infrastructure/clusters/entities/cluster.entity';
import { CliClusterRepository } from '../../lib/repositories/cli-cluster.repository';
import { printContextBanner } from '../../lib/context-banner';

export default class EnvStop extends Command {
  static readonly description =
    'Shutdown observability cluster servers (saves costs while preserving data)';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    printContextBanner();
    let spinner = ora('Initializing...').start();

    try {
      // Bootstrap NestJS and get services
      const app = await getNestApp();
      spinner.succeed('Initialized');

      console.log(chalk.cyan('\n💤 Stopping Observability Cluster\n'));

      spinner = ora('Finding cluster...').start();
      const observabilityService = app.get(CliObservabilityClusterService);

      // Get observability cluster
      const cluster = await observabilityService.getObservabilityCluster();

      if (!cluster) {
        spinner.fail('No observability cluster found');
        console.log(chalk.yellow('\n⚠️  No observability cluster exists.\n'));
        console.log(`Create one with: ${chalk.cyan('flui env create')}\n`);
        return;
      }

      if (!cluster.nodes || cluster.nodes.length === 0) {
        spinner.fail('No cluster nodes found');
        console.log(chalk.yellow('\n⚠️  Cluster has no nodes.\n'));
        return;
      }

      spinner.succeed(`Found cluster with ${cluster.nodes.length} node(s)`);

      // Get Hetzner provider (we need the concrete type for poweroff)
      const hetznerProvider = app.get(HetznerProviderService);

      // Check if all servers are already stopped
      let allStopped = true;
      const serverStates: Array<{ name: string; id: string; status: string }> =
        [];

      spinner = ora('Checking server states...').start();
      for (const node of cluster.nodes) {
        try {
          const serverDto = await hetznerProvider.getServerDetailsAsDto(
            node.providerResourceId,
          );
          if (serverDto) {
            serverStates.push({
              name: node.serverName,
              id: node.providerResourceId,
              status: serverDto.status,
            });

            if (serverDto.status !== 'off') {
              allStopped = false;
            }
          }
        } catch {
          spinner.warn(`Could not check status for ${node.serverName}`);
        }
      }
      spinner.succeed('Server states checked');

      if (allStopped) {
        console.log(
          chalk.yellow('\n⚠️  All cluster servers are already stopped.\n'),
        );
        console.log(
          `   Current cost: ~${0.6 * cluster.nodes.length}€/month (storage only)`,
        );

        // Update cluster status to STOPPED if not already
        if (cluster.status !== ClusterStatus.STOPPED) {
          spinner = ora('Updating cluster status...').start();
          const clusterRepository = app.get(CliClusterRepository);
          cluster.status = ClusterStatus.STOPPED;
          await clusterRepository.save(cluster);
          spinner.succeed('Cluster status updated');
        }

        console.log(`\n   To restart them, run:`);
        console.log(`   ${chalk.cyan('flui env restart')}\n`);
        return;
      }

      // Show cluster info
      console.log(chalk.cyan('\n📋 Cluster Information:\n'));
      console.log(`   ${chalk.bold('Name:')}   ${cluster.name}`);
      console.log(`   ${chalk.bold('ID:')}     ${cluster.id}`);
      console.log(`   ${chalk.bold('Nodes:')}  ${cluster.nodes.length}`);
      console.log(`   ${chalk.bold('Region:')} ${cluster.region}\n`);

      // Stop all running servers
      let stoppedCount = 0;
      for (const state of serverStates) {
        if (state.status === 'off') {
          console.log(chalk.dim(`   ${state.name} - already stopped`));
        } else {
          spinner = ora(`Powering off ${state.name}...`).start();
          try {
            await hetznerProvider.powerOffServer(state.id);
            spinner.succeed(`${state.name} powered off`);
            stoppedCount++;
          } catch (error) {
            spinner.fail(`Failed to power off ${state.name}: ${error.message}`);
          }
        }
      }

      if (stoppedCount > 0) {
        console.log(
          chalk.green(`\n✅ Successfully stopped ${stoppedCount} server(s)\n`),
        );

        // Update cluster status to STOPPED
        spinner = ora('Updating cluster status...').start();
        const clusterRepository = app.get(CliClusterRepository);
        cluster.status = ClusterStatus.STOPPED;
        await clusterRepository.save(cluster);
        spinner.succeed('Cluster status updated');
      }

      console.log(chalk.cyan('💰 Cost Savings:\n'));
      console.log(
        `   ${chalk.bold('Before:')} ~${7.5 * cluster.nodes.length}€/month (running)`,
      );
      console.log(
        `   ${chalk.bold('After:')}  ~${0.6 * cluster.nodes.length}€/month (storage only)`,
      );
      console.log(
        `   ${chalk.bold('Savings:')} ~92% (${(6.9 * cluster.nodes.length).toFixed(2)}€/month)\n`,
      );

      console.log(chalk.cyan('📦 Data Persistence:\n'));
      console.log('   All data is preserved:');
      console.log('   ✓ PostgreSQL databases');
      console.log('   ✓ Redis data');
      console.log('   ✓ Prometheus metrics (last 7 days)');
      console.log('   ✓ Loki logs (last 7 days)');
      console.log('   ✓ Grafana dashboards and settings\n');

      console.log(chalk.cyan('🔄 Restart:\n'));
      console.log('   To start the servers again, run:');
      console.log(`   ${chalk.cyan('flui env restart')}`);
      console.log(
        `\n   Or check status with: ${chalk.cyan('flui env status')}\n`,
      );
    } catch (error) {
      spinner.fail('Failed to stop environment');
      console.log(chalk.red('\n❌ Error:\n'));

      if (error instanceof Error) {
        console.log(`   ${error.message}\n`);
      } else {
        console.log(`   ${String(error)}\n`);
      }

      this.exit(1);
    } finally {
      await closeNestApp();
    }
  }
}
