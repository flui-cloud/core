import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { ServerTypeCacheService } from '../../services/server-type-cache.service';
import { ServerTypeValidatorService } from '../../services/server-type-validator.service';
import { CLI_DEFAULTS } from '../../config/defaults';
import { ProviderFactory } from 'src/modules/providers/core/factories/provider.factory';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';

export default class ServerTypesList extends Command {
  static readonly description = 'List available server types for a provider';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> --provider hetzner',
    '<%= config.bin %> <%= command.id %> --provider hetzner --region fsn1',
    '<%= config.bin %> <%= command.id %> --provider hetzner --json',
    '<%= config.bin %> <%= command.id %> --provider hetzner --force-refresh',
  ];

  static readonly flags = {
    provider: Flags.string({
      char: 'p',
      description: 'Cloud provider',
      options: ['hetzner', 'scaleway'],
      required: true,
    }),
    region: Flags.string({
      char: 'r',
      description: 'Filter by region/location',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    'force-refresh': Flags.boolean({
      description: 'Force refresh cache from API',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ServerTypesList);
    const app = await getNestApp();

    try {
      const cacheService = new ServerTypeCacheService();
      const validatorService = new ServerTypeValidatorService();
      const providerFactory = app.get(ProviderFactory);
      const cloudProvider = flags.provider as CloudProvider;
      let serverTypes;

      const fetchFromProvider = async () => {
        const providerService = providerFactory.getProvider(cloudProvider);
        if (!providerService.getNodeSizes) {
          throw new Error(
            `Provider ${flags.provider} does not support listing node sizes`,
          );
        }
        return providerService.getNodeSizes(true);
      };

      if (flags['force-refresh']) {
        if (!flags.json) {
          this.log(chalk.dim(`Fetching server types from ${flags.provider}...`));
        }
        serverTypes = await fetchFromProvider();
        await cacheService.set(flags.provider, serverTypes);
      } else {
        serverTypes = await cacheService.get(flags.provider);

        if (serverTypes) {
          const cacheInfo = await cacheService.getCacheInfo(flags.provider);
          if (!flags.json) {
            this.log(
              chalk.dim(
                `Using cached data (expires: ${cacheInfo.expiresAt?.toLocaleString()})`,
              ),
            );
          }
        } else {
          if (!flags.json) {
            this.log(
              chalk.dim(
                `Cache miss. Fetching server types from ${flags.provider}...`,
              ),
            );
          }
          serverTypes = await fetchFromProvider();
          await cacheService.set(flags.provider, serverTypes);
        }
      }

      // Filter by region if specified
      if (flags.region && serverTypes) {
        serverTypes = serverTypes.filter((type) => {
          // Use real-time availability if present
          if (type.availability && type.availability.length > 0) {
            const av = type.availability.find(
              (a) => a.location === flags.region,
            );
            return av ? av.available && !av.deprecated : false;
          }
          // Fallback to old logic
          return type.locations.some((loc) => loc.name === flags.region);
        });
      }

      // Filter out deprecated types
      const activeTypes = serverTypes?.filter((type) => !type.deprecated) || [];
      const deprecatedTypes =
        serverTypes?.filter((type) => type.deprecated) || [];

      if (activeTypes.length === 0) {
        this.log(chalk.yellow('No active server types found'));
        return;
      }

      // JSON output
      if (flags.json) {
        this.log(
          JSON.stringify(
            { active: activeTypes, deprecated: deprecatedTypes },
            null,
            2,
          ),
        );
        return;
      }

      this.log('');
      this.log(chalk.bold(`Available Server Types (${flags.provider}):`));
      this.log('');

      const formatPrice = (raw?: string): string => {
        if (!raw) return '-';
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) ? `€${n.toFixed(2)}` : '-';
      };

      const computeAvailability = (
        type: (typeof activeTypes)[number],
      ): { label: string; color: (s: string) => string } => {
        const regions = validatorService.getAvailableRegions(type);
        const outOfStock = validatorService.getOutOfStockRegions(type);
        if (flags.region) {
          const isAvailable = validatorService.isAvailableInRegion(
            type,
            flags.region,
          );
          return {
            label: isAvailable ? 'Yes' : 'No',
            color: isAvailable ? chalk.green : chalk.red,
          };
        }
        if (regions.length === 0) return { label: 'None', color: chalk.red };
        if (outOfStock.length === 0) return { label: 'All', color: chalk.green };
        if (regions.length > outOfStock.length) {
          return { label: 'Limited', color: chalk.yellow };
        }
        return { label: 'Few', color: chalk.yellow };
      };

      const rows = activeTypes.map((type) => {
        const regions = validatorService.getAvailableRegions(type);
        const regionsStr =
          regions.length > 3
            ? `${regions.slice(0, 3).join(', ')}…`
            : regions.join(', ');
        const availability = computeAvailability(type);
        return {
          id: type.id,
          name: type.name,
          cores: String(type.cores),
          memory: `${type.memory}GB`,
          disk: `${type.disk}GB`,
          availability,
          price: formatPrice(validatorService.getFormattedPrice(type).monthly),
          regions: regionsStr,
        };
      });

      const widthOf = (header: string, values: string[], min: number): number =>
        Math.max(min, header.length, ...values.map((v) => v.length));

      const COL = {
        id: widthOf(
          'ID',
          rows.map((r) => r.id),
          4,
        ),
        name: widthOf(
          'Name',
          rows.map((r) => r.name),
          6,
        ),
        cpu: widthOf(
          'vCPU',
          rows.map((r) => r.cores),
          4,
        ),
        memory: widthOf(
          'Memory',
          rows.map((r) => r.memory),
          6,
        ),
        disk: widthOf(
          'Disk',
          rows.map((r) => r.disk),
          5,
        ),
        available: widthOf(
          'Available',
          rows.map((r) => r.availability.label),
          9,
        ),
        price: widthOf(
          'Price/Month',
          rows.map((r) => r.price),
          11,
        ),
      };

      this.log(
        `  ${chalk.bold('ID'.padEnd(COL.id))} ${chalk.bold('Name'.padEnd(COL.name))} ${chalk.bold('vCPU'.padStart(COL.cpu))} ${chalk.bold('Memory'.padStart(COL.memory))} ${chalk.bold('Disk'.padStart(COL.disk))} ${chalk.bold('Available'.padEnd(COL.available))} ${chalk.bold('Price/Month'.padStart(COL.price))} ${chalk.bold('Regions')}`,
      );
      const sepWidth =
        COL.id +
        COL.name +
        COL.cpu +
        COL.memory +
        COL.disk +
        COL.available +
        COL.price +
        20 +
        7;
      this.log(chalk.dim('  ' + '─'.repeat(sepWidth)));

      for (const row of rows) {
        this.log(
          `  ${row.id.padEnd(COL.id)} ${row.name.padEnd(COL.name)} ${row.cores.padStart(COL.cpu)} ${row.memory.padStart(COL.memory)} ${row.disk.padStart(COL.disk)} ${row.availability.color(row.availability.label.padEnd(COL.available))} ${row.price.padStart(COL.price)} ${chalk.dim(row.regions)}`,
        );
      }

      // Show deprecated types if any
      if (deprecatedTypes.length > 0) {
        this.log('');
        this.log(
          chalk.yellow.bold(
            `Deprecated Server Types (${deprecatedTypes.length}):`,
          ),
        );
        this.log(
          chalk.dim('  These types are no longer available for new servers'),
        );
        this.log('');

        for (const type of deprecatedTypes) {
          const memCol = `${type.memory}GB`.padEnd(8);
          const diskCol = `${type.disk}GB`.padEnd(8);
          this.log(
            chalk.dim(
              `  ${type.id.padEnd(12)} ${type.name.padEnd(10)} ${String(type.cores).padEnd(6)} ${memCol} ${diskCol}`,
            ),
          );
        }
      }

      this.log('');

      // Show cache info
      const cacheInfo = await cacheService.getCacheInfo(flags.provider);
      if (cacheInfo.exists) {
        this.log(
          chalk.dim(
            `Cache info: Updated ${cacheInfo.timestamp?.toLocaleString()}, expires ${cacheInfo.expiresAt?.toLocaleString()}`,
          ),
        );
        this.log(
          chalk.dim(
            `Use --force-refresh to update cache manually (auto-refresh every ${CLI_DEFAULTS.SERVER_TYPE_CACHE_TTL_HOURS} hours)`,
          ),
        );
        this.log('');
      }
    } catch (error) {
      // finally's closeNestApp() calls process.exit(exitCode ?? 0) — set it now.
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      this.logToStderr(chalk.red(`Failed to list server types: ${message}`));
    } finally {
      await closeNestApp();
    }
  }
}
