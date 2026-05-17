import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { printContextBanner } from '../../lib/context-banner';
import { CliObservabilityClusterService } from '../../services/cli-observability-cluster.service';
import { CliNodeRepository } from '../../lib/repositories/cli-node.repository';
import { NodeType } from 'src/modules/infrastructure/clusters/entities/cluster-node.entity';
import { CliSshService } from '../../services/cli-ssh.service';

export default class EnvUncordon extends Command {
  static readonly description =
    'Mark a cluster node schedulable again. Recovery helper for when a scale-node ' +
    'operation interrupted before reaching the uncordon step.';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> master',
    '<%= config.bin %> <%= command.id %> worker-1',
  ];

  static readonly args = {
    target: Args.string({
      description: 'Node target: "master" or a worker node serverName',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(EnvUncordon);
    printContextBanner();
    const spinner = ora('Resolving node...').start();

    try {
      const app = await getNestApp();
      const observabilityService = app.get(CliObservabilityClusterService);
      const nodeRepo = app.get(CliNodeRepository);
      const ssh = app.get(CliSshService);

      const cluster = await observabilityService.getObservabilityCluster();
      if (!cluster) {
        spinner.fail('No observability cluster found');
        return;
      }
      const nodes = await nodeRepo.find({ where: { clusterId: cluster.id } });
      const target =
        args.target === 'master'
          ? nodes.find((n) => n.nodeType === NodeType.MASTER)
          : nodes.find((n) => n.serverName === args.target);
      if (!target) {
        spinner.fail(`Node "${args.target}" not found`);
        this.exit(1);
      }
      if (!cluster.masterIpAddress) {
        spinner.fail('Cluster has no masterIpAddress stored');
        this.exit(1);
      }

      spinner.text = `Uncordoning ${target.serverName} via SSH to master...`;
      const out = await ssh.sshExec(
        cluster.masterIpAddress,
        `kubectl uncordon ${target.serverName}`,
      );
      spinner.succeed(`Node ${target.serverName} is now schedulable`);
      if (out.trim()) {
        console.log(chalk.dim(`   ${out.trim()}`));
      }
      console.log('');
    } catch (error) {
      spinner.fail('Uncordon failed');
      console.log(chalk.red('\n❌ Error:\n'));
      console.log(
        `   ${error instanceof Error ? error.message : String(error)}\n`,
      );
      this.exit(1);
    } finally {
      await closeNestApp();
    }
  }
}
