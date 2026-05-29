import { ApiClient } from '../api-client';
import { ConfigStorage } from '../config-storage';
import { CliClusterRepository } from '../repositories/cli-cluster.repository';

/**
 * Reconciliation service
 *
 * CA, Provider, VNet, Observability, Firewall are now seeded automatically
 * by BootstrapSeeder (NestJS OnModuleInit) reading from flui-secrets K8s Secret.
 * No HTTP reconciliation needed for those types.
 *
 * Only DNS remains here — it is API-driven (no data from CLI) and optional.
 */

export enum ReconciliationType {
  DNS = 'dns',
  ALL = 'all',
}

export interface ReconciliationResult {
  type: ReconciliationType;
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export interface ReconciliationOptions {
  types?: ReconciliationType[];
  dryRun?: boolean;
  apiUrl?: string;
}

export class ReconciliationService {
  private readonly configStorage: ConfigStorage;
  private readonly apiClient: ApiClient;
  private readonly clusterRepository: CliClusterRepository;

  constructor(apiUrl: string) {
    this.configStorage = new ConfigStorage();
    this.apiClient = new ApiClient({
      baseUrl: apiUrl,
      apiKey: this.configStorage.getApiKey(),
    });
    this.clusterRepository = new CliClusterRepository();
  }

  async reconcile(options: ReconciliationOptions = {}): Promise<{
    results: ReconciliationResult[];
    allSuccess: boolean;
  }> {
    const types = options.types || [ReconciliationType.ALL];
    const results: ReconciliationResult[] = [];

    const typesToRun = types.includes(ReconciliationType.ALL)
      ? [ReconciliationType.DNS]
      : types;

    for (const type of typesToRun) {
      try {
        let result: ReconciliationResult;
        if (type === ReconciliationType.DNS) {
          result = await this.reconcileDns(options);
        } else {
          result = {
            type,
            success: false,
            message: `Unknown reconciliation type: ${type}`,
          };
        }
        results.push(result);
      } catch (error: any) {
        results.push({
          type,
          success: false,
          message: `Reconciliation failed: ${error.message}`,
          error: error.stack || error.message,
        });
      }
    }

    return { results, allSuccess: results.every((r) => r.success) };
  }

  /**
   * Trigger DNS reconciliation via API (API-driven, no data from CLI).
   * Optional — skipped silently if no DNS is configured.
   */
  private async reconcileDns(
    options: ReconciliationOptions,
  ): Promise<ReconciliationResult> {
    try {
      const cluster = await this.clusterRepository.findOne({
        where: { metadata: { isObservabilityCluster: true } },
      });

      if (!cluster) {
        return {
          type: ReconciliationType.DNS,
          success: true,
          message: 'No control cluster found, skipping DNS reconciliation',
        };
      }

      try {
        const dnsConfig = await this.apiClient.get<{
          id: string;
          baseDomain: string;
          dnsProvider: string;
          reconciliationStatus: string;
        }>(`/dns/cluster/${cluster.id}`);

        if (!dnsConfig) {
          return {
            type: ReconciliationType.DNS,
            success: true,
            message: 'No DNS configuration found for cluster, skipping',
          };
        }

        await this.apiClient.post(`/dns/${dnsConfig.id}/reconcile`);

        return {
          type: ReconciliationType.DNS,
          success: true,
          message: `DNS reconciliation triggered for ${dnsConfig.baseDomain}`,
          details: {
            baseDomain: dnsConfig.baseDomain,
            dnsProvider: dnsConfig.dnsProvider,
          },
        };
      } catch (apiError: any) {
        if (apiError.status === 404 || apiError.statusCode === 404) {
          return {
            type: ReconciliationType.DNS,
            success: true,
            message: 'No DNS configuration found for cluster, skipping',
          };
        }
        throw apiError;
      }
    } catch (error: any) {
      return {
        type: ReconciliationType.DNS,
        success: false,
        message: `DNS reconciliation failed: ${error.message}`,
        error: error.stack || error.message,
      };
    }
  }
}
