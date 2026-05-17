import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { buildNipBaseDomain } from '../../lib/nip-base-domain.util';
import { CliObservabilityClusterService } from '../../services/cli-observability-cluster.service';
import { FirewallProviderFactory } from '../../../../src/modules/providers/core/factories/firewall-provider.factory';
import { CloudProvider } from '../../../../src/modules/providers/enums/cloud-provider.enum';
import { IpDetectionService } from '../../lib/utils/ip-detection';
import { CliFirewallRepository } from '../../lib/repositories/cli-firewall.repository';
import { OBSERVABILITY_FIREWALL_RULES } from '../../lib/templates/firewall-rules';
import { printContextBanner } from '../../lib/context-banner';

export default class EnvUpdateFirewall extends Command {
  static readonly description =
    'Create or update firewall IP ranges for observability cluster';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --ip 203.0.113.42',
    '<%= config.bin %> <%= command.id %> --ip "203.0.113.0/24,198.51.100.5/32"',
  ];

  static readonly flags = {
    ip: Flags.string({
      description:
        'Source IP/CIDR or comma-separated list (default: auto-detect current IP)',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EnvUpdateFirewall);
    printContextBanner();
    let spinner = ora('Loading cluster information...').start();

    try {
      const app = await getNestApp();
      const observabilityService = app.get(CliObservabilityClusterService);
      const ipService = app.get(IpDetectionService);
      const firewallFactory = app.get(FirewallProviderFactory);
      const firewallRepo = app.get(CliFirewallRepository);

      const cluster = await observabilityService.getObservabilityCluster();

      if (!cluster) {
        spinner.fail('No observability cluster found');
        console.log(chalk.yellow('\n⚠️  No observability cluster exists.\n'));
        console.log(chalk.dim('Create one with:'));
        console.log(`   ${chalk.cyan('flui env create')}\n`);
        return;
      }

      spinner.succeed(`Cluster found (${cluster.provider})`);

      const providerEnum = (
        cluster.provider || ''
      ).toLowerCase() as CloudProvider;
      const firewallService =
        firewallFactory.getFirewallProviderOrFail(providerEnum);
      const providerLabel = providerEnum.toUpperCase() as
        | 'HETZNER'
        | 'SCALEWAY';

      let sourceCidrs: string[];
      if (flags.ip) {
        sourceCidrs = ipService.parseCidrList(flags.ip);
        console.log(
          chalk.blue(`\nUsing custom IP(s): ${sourceCidrs.join(', ')}`),
        );
      } else {
        spinner = ora('Detecting public IP...').start();
        const publicIp = await ipService.getPublicIp();
        sourceCidrs = [ipService.toCidr(publicIp)];
        spinner.succeed(`Auto-detected IP: ${sourceCidrs[0]}`);
      }

      spinner = ora('Finding firewall...').start();
      let existingFirewall = await firewallRepo.findByClusterId(cluster.id);
      if (!existingFirewall) {
        const byProvider = await firewallRepo.findByProvider(providerLabel);
        if (byProvider.length === 1) {
          existingFirewall = byProvider[0];
          spinner.text = `Adopting unlinked ${providerLabel} firewall ${existingFirewall.name}`;
        } else if (byProvider.length > 1) {
          const masterIds = (cluster.nodes || [])
            .filter((n: any) => n.nodeType === 'master')
            .map((n: any) => {
              const raw = String(n.providerResourceId || '');
              const parts = raw.split(':');
              return parts.at(-1);
            })
            .filter(Boolean);

          spinner.text = `Disambiguating ${byProvider.length} firewall candidates by master attachment...`;
          const matches: any[] = [];
          for (const fw of byProvider) {
            const details = await firewallService
              .getFirewall(fw.id)
              .catch(() => null);
            if (!details) continue;
            const attached = new Set(details.appliedTo.map((a) => a.serverId));
            if (masterIds.some((m: string) => attached.has(m))) {
              matches.push(fw);
            }
          }
          if (matches.length === 1) {
            existingFirewall = matches[0];
            spinner.text = `Found attached firewall ${existingFirewall.name}`;
          } else if (matches.length === 0) {
            spinner.fail(
              'No firewall currently attached to the cluster master',
            );
            this.exit(1);
          } else {
            spinner.fail('Multiple firewalls attached, cannot disambiguate');
            for (const f of matches) this.log(`  - ${f.name} (${f.id})`);
            this.exit(1);
          }
        }
      }

      if (existingFirewall) {
        spinner.text = 'Updating firewall rules...';
        const newRules = OBSERVABILITY_FIREWALL_RULES(sourceCidrs);

        await firewallService.updateFirewallRules(
          existingFirewall.id,
          newRules,
        );

        existingFirewall.clusterId = cluster.id;
        existingFirewall.provider = providerLabel;
        existingFirewall.sourceCidrs = sourceCidrs;
        existingFirewall.rules = newRules;
        await firewallRepo.save(existingFirewall);

        spinner.succeed('Firewall updated successfully');
      } else {
        spinner.text = 'Creating firewall...';
        const firewallName = `flui-observability-${cluster.id}`;
        const rules = OBSERVABILITY_FIREWALL_RULES(sourceCidrs);

        const result = await firewallService.createFirewall({
          name: firewallName,
          labels: [
            { key: 'managed-by', value: 'flui-cloud' },
            { key: 'flui-resource-type', value: 'firewall' },
            { key: 'flui-cluster-id', value: cluster.id },
            { key: 'flui-cluster-type', value: 'observability' },
          ],
          rules,
          applyToLabelSelector: `flui-cluster-id=${cluster.id}`,
        });

        const serverIds = (cluster.nodes || [])
          .map((n: any) => n.providerResourceId)
          .filter(
            (x: any): x is string => typeof x === 'string' && x.length > 0,
          );

        if (serverIds.length > 0) {
          await firewallService.applyToServers(result.firewallId, serverIds);
        }

        await firewallRepo.save({
          id: result.firewallId,
          name: firewallName,
          provider: providerLabel,
          clusterId: cluster.id,
          rules,
          appliedToServerIds: serverIds,
          sourceCidrs,
          labels: [
            { key: 'managed-by', value: 'flui-cloud' },
            { key: 'flui-cluster-id', value: cluster.id },
          ],
        });

        spinner.succeed('Firewall created successfully');
      }

      console.log(chalk.cyan('\n📋 Firewall Configuration:\n'));
      console.log(`   ${chalk.bold('Provider:')}   ${providerLabel}`);
      console.log(`   ${chalk.bold('Cluster:')}    ${cluster.name}`);
      console.log(`   ${chalk.bold('Source IP:')}  ${sourceCidrs.join(', ')}`);
      console.log('');
      console.log(chalk.bold('Exposed Services:'));
      console.log(`   SSH:         ${cluster.masterIpAddress}:22`);
      const baseDomain = buildNipBaseDomain(
        cluster.masterIpAddress,
        cluster.nipHostnameToken,
      );
      console.log(`   Flui API:    https://api.${baseDomain}`);
      console.log(`   Dashboard:   https://app.${baseDomain}`);
      console.log(
        `   Grafana/Prometheus/Loki: cluster-internal (kubectl port-forward)`,
      );
      console.log('');
    } catch (error) {
      spinner.fail('Failed to configure firewall');
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
