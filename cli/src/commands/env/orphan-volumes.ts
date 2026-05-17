import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { ProviderFactory } from 'src/modules/providers/core/factories/provider.factory';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';
import { CliClusterRepository } from '../../lib/repositories/cli-cluster.repository';
import { confirmPrompt } from '../../lib/prompts';
import { printContextBanner } from '../../lib/context-banner';

export default class EnvOrphanVolumes extends Command {
  static readonly description =
    'List or clean up Flui-managed block volumes left behind by past destroys';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --cleanup',
    '<%= config.bin %> <%= command.id %> --provider scaleway --cleanup',
  ];

  static readonly flags = {
    provider: Flags.string({
      char: 'p',
      description: 'Scan only one provider (hetzner | scaleway)',
      options: ['hetzner', 'scaleway'],
    }),
    cleanup: Flags.boolean({
      description: 'Detach and delete the listed orphan volumes',
      default: false,
    }),
    yes: Flags.boolean({
      char: 'y',
      description: 'Skip confirmation prompt during cleanup',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EnvOrphanVolumes);
    printContextBanner();
    const app = await getNestApp();
    try {
      const providerFactory = app.get(ProviderFactory);
      const clusterRepo = app.get(CliClusterRepository);
      const clusters = await clusterRepo.find();
      const knownVolumeIds = new Set<string>();
      for (const c of clusters) {
        const id = c.sharedStorageVolumeId;
        if (!id) continue;
        knownVolumeIds.add(id);
        const colon = id.indexOf(':');
        if (colon > 0) knownVolumeIds.add(id.slice(colon + 1));
        else knownVolumeIds.add(id);
      }

      const targets: CloudProvider[] = flags.provider
        ? [flags.provider as CloudProvider]
        : [CloudProvider.HETZNER, CloudProvider.SCALEWAY];

      const spinner = ora(
        'Scanning providers for Flui-managed volumes...',
      ).start();
      const orphans: Array<{
        provider: CloudProvider;
        volumeId: string;
        name: string;
        sizeGb: number;
        region?: string;
        attached: boolean;
      }> = [];
      for (const p of targets) {
        try {
          const svc = providerFactory.getProvider(p);
          if (!svc.listFluiManagedVolumes) continue;
          const list = await svc.listFluiManagedVolumes();
          for (const v of list) {
            if (knownVolumeIds.has(v.volumeId)) continue;
            const colon = v.volumeId.indexOf(':');
            const bareId = colon > 0 ? v.volumeId.slice(colon + 1) : v.volumeId;
            if (knownVolumeIds.has(bareId)) continue;
            orphans.push({
              provider: p,
              volumeId: v.volumeId,
              name: v.name,
              sizeGb: v.sizeGb,
              region: v.region,
              attached: !!v.attachedServerId,
            });
          }
        } catch (err) {
          spinner.warn(`${p} scan failed: ${(err as Error).message}`);
        }
      }
      spinner.succeed(
        `Scan complete — ${orphans.length} orphan volume(s) found`,
      );

      if (orphans.length === 0) {
        console.log(chalk.green('\n✅ No orphan volumes detected.\n'));
        return;
      }

      console.log('');
      let totalGb = 0;
      for (const v of orphans) {
        totalGb += v.sizeGb;
        console.log(
          `   ${chalk.bold(v.provider)}  ${chalk.cyan(v.volumeId)}  ` +
            `${v.sizeGb} GB  ${v.region ?? '?'}  ${chalk.dim(v.name)}` +
            (v.attached ? chalk.yellow('  [attached]') : ''),
        );
      }
      console.log(
        chalk.dim(`\n   Total: ${orphans.length} volume(s), ${totalGb} GB\n`),
      );

      if (!flags.cleanup) {
        console.log(
          chalk.dim(
            '   Re-run with --cleanup to detach and delete these volumes.\n',
          ),
        );
        return;
      }

      if (!flags.yes) {
        const confirmed = await confirmPrompt(
          chalk.yellow(
            `Delete ${orphans.length} orphan volume(s)? This is irreversible`,
          ),
          false,
        );
        if (!confirmed) {
          console.log(chalk.green('\n✅ Cleanup cancelled\n'));
          return;
        }
      }

      let deleted = 0;
      let failed = 0;
      for (const v of orphans) {
        const cleanupSpinner = ora(
          `Cleaning up ${v.provider} ${v.volumeId} (${v.sizeGb} GB)...`,
        ).start();
        try {
          const svc = providerFactory.getProvider(v.provider);
          if (svc.detachVolume) {
            try {
              await svc.detachVolume(v.volumeId);
            } catch (err) {
              cleanupSpinner.text = `Detach failed, attempting delete anyway... (${(err as Error).message})`;
            }
          }
          if (!svc.deleteVolume) {
            cleanupSpinner.fail(
              `Provider ${v.provider} has no deleteVolume primitive`,
            );
            failed++;
            continue;
          }
          await svc.deleteVolume(v.volumeId);
          cleanupSpinner.succeed(`Deleted ${v.provider} ${v.volumeId}`);
          deleted++;
        } catch (err) {
          cleanupSpinner.fail(
            `Failed to delete ${v.volumeId}: ${(err as Error).message}`,
          );
          failed++;
        }
      }
      console.log('');
      console.log(
        chalk.green(`✅ Deleted ${deleted} volume(s)`) +
          (failed > 0 ? chalk.red(` · ${failed} failed`) : ''),
      );
      console.log('');
    } finally {
      await closeNestApp();
    }
  }
}
