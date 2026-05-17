import { Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { CliObservabilityClusterService } from '../../services/cli-observability-cluster.service';
import { HetznerProviderService } from 'src/modules/providers/services/hetzner-provider.service';
import { ClusterStatus } from 'src/modules/infrastructure/clusters/entities/cluster.entity';
import { CliClusterRepository } from '../../lib/repositories/cli-cluster.repository';
import { printContextBanner } from '../../lib/context-banner';

export default class EnvRestart extends Command {
  static readonly description = 'Restart stopped observability cluster servers';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    printContextBanner();
    let spinner = ora('Initializing...').start();

    try {
      // Bootstrap NestJS and get services
      const app = await getNestApp();
      spinner.succeed('Initialized');

      console.log(chalk.cyan('\n🔄 Restarting Observability Cluster\n'));

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

      // Check if cluster is already running
      if (cluster.status === ClusterStatus.READY) {
        console.log(chalk.yellow('\n⚠️  Cluster is already running.\n'));
        console.log(`   Check status with: ${chalk.cyan('flui env status')}\n`);
        return;
      }

      // Get Hetzner provider (we need the concrete type for poweron)
      const hetznerProvider = app.get(HetznerProviderService);

      // Check current server states
      let allRunning = true;
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

            if (serverDto.status !== 'running') {
              allRunning = false;
            }
          }
        } catch {
          spinner.warn(`Could not check status for ${node.serverName}`);
        }
      }
      spinner.succeed('Server states checked');

      if (allRunning) {
        console.log(
          chalk.yellow('\n⚠️  All cluster servers are already running.\n'),
        );

        // Update cluster status to READY
        spinner = ora('Updating cluster status...').start();
        const clusterRepository = app.get(CliClusterRepository);
        cluster.status = ClusterStatus.READY;
        await clusterRepository.save(cluster);
        spinner.succeed('Cluster status updated to READY');

        console.log(
          `\n   Check status with: ${chalk.cyan('flui env status')}\n`,
        );
        return;
      }

      // Show cluster info
      console.log(chalk.cyan('\n📋 Cluster Information:\n'));
      console.log(`   ${chalk.bold('Name:')}   ${cluster.name}`);
      console.log(`   ${chalk.bold('ID:')}     ${cluster.id}`);
      console.log(`   ${chalk.bold('Nodes:')}  ${cluster.nodes.length}`);
      console.log(`   ${chalk.bold('Region:')} ${cluster.region}\n`);

      // Start all stopped servers
      let startedCount = 0;
      for (const state of serverStates) {
        if (state.status === 'off') {
          spinner = ora(`Powering on ${state.name}...`).start();
          try {
            await hetznerProvider.powerOnServer(state.id);
            spinner.succeed(`${state.name} powered on`);
            startedCount++;
          } catch (error) {
            spinner.fail(`Failed to power on ${state.name}: ${error.message}`);
          }
        } else {
          console.log(chalk.dim(`   ${state.name} - already running`));
        }
      }

      if (startedCount > 0) {
        console.log(
          chalk.green(`\n✅ Successfully started ${startedCount} server(s)\n`),
        );

        // Wait for servers to become ready
        spinner = ora('Waiting for servers to boot...').start();
        await this.sleep(10000); // Wait 10 seconds for servers to boot
        spinner.succeed('Servers should be booting');

        // Wait for K3s services to be ready
        console.log(chalk.cyan('\n⏳ Waiting for services to be ready...\n'));
        console.log(
          chalk.dim('   This may take 1-2 minutes as K3s restarts...\n'),
        );

        const maxAttempts = 24; // 2 minutes with 5 second intervals
        let servicesReady = false;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          spinner = ora(
            `Checking services (attempt ${attempt}/${maxAttempts})...`,
          ).start();

          try {
            const servicesHealth =
              await observabilityService.checkObservabilityServices(
                cluster.masterIpAddress,
                cluster.nipHostnameToken,
              );

            const allHealthy =
              servicesHealth.prometheus === 'healthy' &&
              servicesHealth.grafana === 'healthy' &&
              servicesHealth.loki === 'healthy';

            if (allHealthy) {
              spinner.succeed('All services are ready!');
              servicesReady = true;
              break;
            } else {
              spinner.text = `Services not ready yet (${attempt}/${maxAttempts})...`;
              spinner.color = 'yellow';
              await this.sleep(5000);
              spinner.stop();
            }
          } catch {
            spinner.stop();
            if (attempt < maxAttempts) {
              await this.sleep(5000);
            }
          }
        }

        if (!servicesReady) {
          console.log(
            chalk.yellow(
              '\n⚠️  Services are taking longer than expected to start.\n',
            ),
          );
          console.log(
            chalk.dim('   They may still be initializing. Check again with:'),
          );
          console.log(`   ${chalk.cyan('flui env status')}\n`);
        }

        // Update cluster status to READY
        spinner = ora('Updating cluster status...').start();
        const clusterRepository = app.get(CliClusterRepository);
        cluster.status = ClusterStatus.READY;
        await clusterRepository.save(cluster);
        spinner.succeed('Cluster status updated to READY');
      }

      console.log(chalk.cyan('\n💰 Cost Information:\n'));
      console.log(
        `   ${chalk.bold('Current cost:')} ~${7.5 * cluster.nodes.length}€/month (running)`,
      );
      console.log(`   ${chalk.dim('To save costs when not in use:')}`);
      console.log(`   ${chalk.cyan('flui env stop')}\n`);

      console.log(chalk.cyan('\n🔗 Next Steps:\n'));
      console.log(`   Check cluster status: ${chalk.cyan('flui env status')}`);
      console.log(`   View endpoints and credentials\n`);
    } catch (error) {
      spinner.fail('Failed to restart environment');
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

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
