import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { GrafanaConfigService } from './grafana-config.service';

/**
 * Service for managing Grafana datasources via HTTP API
 * Automatically adds/removes datasources when clusters are created/deleted
 */
@Injectable()
export class GrafanaDatasourceService {
  private readonly logger = new Logger(GrafanaDatasourceService.name);
  private grafanaClient: AxiosInstance;

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly configService: ConfigService,
    private readonly grafanaConfigService: GrafanaConfigService,
  ) {}

  /**
   * Add Prometheus datasource to Grafana for a workload cluster
   * Called automatically when a workload cluster becomes READY
   *
   * NOTE: Loki datasource is NOT created per-cluster.
   * A centralized Loki datasource is created once for the observability cluster.
   * All workload clusters send logs to the same Loki instance, filtered by labels.
   */
  async addClusterDatasources(cluster: ClusterEntity): Promise<void> {
    this.logger.log(
      `Adding Prometheus datasource for cluster ${cluster.name} (${cluster.id})`,
    );

    // Initialize Grafana client with credentials
    await this.initializeGrafanaClient();

    // Create Prometheus datasource and get its UID
    const prometheusUid = await this.createPrometheusDatasource(cluster);

    this.logger.log(
      `Successfully added Prometheus datasource for cluster ${cluster.name} (UID: ${prometheusUid})`,
    );

    // Save Prometheus UID in cluster metadata
    await this.saveGrafanaDatasourceUIDs(cluster.id, prometheusUid, null);
  }

  /**
   * Remove datasources when cluster is deleted
   * Called automatically before cluster deletion
   */
  async removeClusterDatasources(clusterId: string): Promise<void> {
    this.logger.log(`Removing datasources for cluster ${clusterId}`);

    try {
      await this.initializeGrafanaClient();

      // Find all datasources and filter by cluster ID in name or metadata
      const allDatasources = await this.listDatasources();

      // Find datasources that belong to this cluster
      const clusterDatasources = allDatasources.filter(
        (ds) =>
          ds.name?.includes(`Cluster`) &&
          (ds.name?.includes(clusterId) ||
            ds.jsonData?.customQueryParameters?.includes(clusterId)),
      );

      if (clusterDatasources.length === 0) {
        this.logger.warn(`No datasources found for cluster ${clusterId}`);
        return;
      }

      // Delete each datasource
      for (const ds of clusterDatasources) {
        await this.deleteDatasource(ds.uid);
      }

      this.logger.log(
        `Successfully removed ${clusterDatasources.length} datasources for cluster ${clusterId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to remove datasources for cluster ${clusterId}: ${error.message}`,
      );
      // Don't throw - cluster deletion should proceed even if Grafana cleanup fails
    }
  }

  /**
   * Create Prometheus datasource in Grafana
   * Returns the auto-generated UID
   */
  private async createPrometheusDatasource(
    cluster: ClusterEntity,
  ): Promise<string> {
    // Get Prometheus endpoint from environment configuration
    // This points to the observability cluster Prometheus instance
    const prometheusEndpoint = this.configService.get<string>(
      'PROMETHEUS_ENDPOINT',
    );

    if (!prometheusEndpoint) {
      throw new Error('PROMETHEUS_ENDPOINT not configured in environment');
    }

    const datasource = {
      name: `Cluster ${cluster.name} - Prometheus`,
      type: 'prometheus',
      // Don't specify UID - let Grafana generate it automatically
      // This guarantees uniqueness and avoids validation issues
      url: prometheusEndpoint,
      access: 'proxy',
      isDefault: false,
      jsonData: {
        timeInterval: '60s',
        httpMethod: 'POST',
        customQueryParameters: `cluster_id=${cluster.id}`,
      },
    };

    try {
      const response = await this.grafanaClient.post(
        '/api/datasources',
        datasource,
      );
      const createdDatasource = response.data;

      this.logger.debug(
        `Grafana API response: ${JSON.stringify(createdDatasource)}`,
      );

      // Grafana returns different structures depending on version
      // Try to extract UID from response (could be in datasource.uid or id)
      const uid =
        createdDatasource.datasource?.uid ||
        createdDatasource.uid ||
        `${createdDatasource.id}`;

      this.logger.log(
        `Created Prometheus datasource for cluster ${cluster.name} (UID: ${uid})`,
      );

      // Return the auto-generated UID for reference
      return uid;
    } catch (error) {
      if (error.response?.status === 409) {
        // Datasource already exists - find it by name and update
        this.logger.warn(
          `Prometheus datasource already exists for cluster ${cluster.name}, updating...`,
        );

        // Get existing datasource by name to find its UID
        const existingUid = await this.findDatasourceUidByName(datasource.name);
        if (existingUid) {
          await this.updateDatasource(existingUid, datasource);
          return existingUid; // Return the UID of the updated datasource
        }
        throw new Error('Failed to find existing datasource for update');
      } else {
        // Log detailed error information for debugging
        this.logger.error(
          `Failed to create Prometheus datasource for cluster ${cluster.name}:`,
        );
        this.logger.error(`  Status: ${error.response?.status}`);
        this.logger.error(
          `  Response: ${JSON.stringify(error.response?.data)}`,
        );
        this.logger.error(
          `  Datasource payload: ${JSON.stringify(datasource, null, 2)}`,
        );
        throw error;
      }
    }
  }

  /**
   * Create centralized Loki datasource in Grafana
   * This datasource is shared across all workload clusters
   * Logs are filtered using labels: {cluster_name="...", service="...", etc.}
   */
  async createCentralizedLokiDatasource(): Promise<void> {
    this.logger.log('Creating centralized Loki datasource in Grafana');

    try {
      await this.initializeGrafanaClient();

      // Get Loki endpoint from environment configuration
      const lokiEndpoint = this.configService.get<string>('LOKI_ENDPOINT');

      if (!lokiEndpoint) {
        throw new Error('LOKI_ENDPOINT not configured in environment');
      }

      const datasource = {
        name: 'Centralized Loki - All Clusters',
        type: 'loki',
        uid: 'centralized-loki',
        url: lokiEndpoint,
        access: 'proxy',
        isDefault: true, // Make this the default Loki datasource
        jsonData: {
          maxLines: 1000,
          timeout: 60,
          // Derived fields can link to metrics (once we know which Prometheus to use)
          derivedFields: [],
        },
      };

      try {
        await this.grafanaClient.post('/api/datasources', datasource);
        this.logger.log(
          `Created centralized Loki datasource pointing to ${lokiEndpoint}`,
        );
      } catch (error) {
        if (error.response?.status === 409) {
          // Datasource already exists - update it
          this.logger.warn(
            'Centralized Loki datasource already exists, updating...',
          );
          await this.updateDatasource(datasource.uid, datasource);
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to create centralized Loki datasource: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async updateDatasource(
    uid: string,
    datasource: Record<string, unknown>,
  ): Promise<void> {
    try {
      const response = await this.grafanaClient.get(
        `/api/datasources/uid/${uid}`,
      );
      const existingDatasource = response.data as { id: number };
      await this.grafanaClient.put(
        `/api/datasources/${existingDatasource.id}`,
        datasource,
      );
      this.logger.log(`Updated Grafana datasource ${uid}`);
    } catch (error) {
      this.logger.error(`Failed to update datasource ${uid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete datasource by UID
   */
  private async deleteDatasource(uid: string): Promise<void> {
    try {
      await this.grafanaClient.delete(`/api/datasources/uid/${uid}`);
      this.logger.log(`Deleted datasource ${uid}`);
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn(
          `Datasource ${uid} not found (already deleted or never existed)`,
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Initialize Grafana HTTP client with authentication
   */
  private async initializeGrafanaClient(): Promise<void> {
    if (this.grafanaClient) {
      return; // Already initialized
    }

    // Get Grafana credentials from GrafanaConfigService
    const credentials = await this.grafanaConfigService.getGrafanaCredentials();

    // Create authenticated axios client
    this.grafanaClient = axios.create({
      baseURL: credentials.url,
      auth: {
        username: credentials.username, // Use dynamic username from credentials
        password: credentials.password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });

    this.logger.log(
      `Grafana client initialized for ${credentials.url} (user: ${credentials.username})`,
    );
  }

  /**
   * Test Grafana connectivity
   * Useful for health checks and debugging
   */
  async testGrafanaConnection(): Promise<boolean> {
    try {
      await this.initializeGrafanaClient();

      // Test API by getting Grafana health
      const response = await this.grafanaClient.get('/api/health');

      if (response.status === 200) {
        this.logger.log('Grafana connection test successful');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Grafana connection test failed: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * List all datasources in Grafana
   * Useful for debugging and validation
   */
  async listDatasources(): Promise<any[]> {
    try {
      await this.initializeGrafanaClient();

      const response = await this.grafanaClient.get('/api/datasources');
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to list datasources: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find datasource UID by name
   * Used when we need to update an existing datasource
   */
  private async findDatasourceUidByName(name: string): Promise<string | null> {
    try {
      const datasources = await this.listDatasources();
      const found = datasources.find((ds) => ds.name === name);
      return found?.uid || null;
    } catch (error) {
      this.logger.error(
        `Failed to find datasource by name ${name}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Save Grafana datasource UIDs to cluster metadata
   * This allows the UIDs to be exposed via API and tracked over time
   */
  private async saveGrafanaDatasourceUIDs(
    clusterId: string,
    prometheusUid: string,
    lokiUid: string,
  ): Promise<void> {
    try {
      const cluster = await this.clusterRepository.findOne({
        where: { id: clusterId },
      });

      if (!cluster) {
        this.logger.warn(
          `Cluster ${clusterId} not found, cannot save Grafana datasource UIDs`,
        );
        return;
      }

      // Update metadata with Grafana datasource UIDs
      cluster.metadata = {
        ...cluster.metadata,
        grafana: {
          prometheusUid,
          lokiUid,
          registeredAt: new Date().toISOString(),
        },
      };

      await this.clusterRepository.save(cluster);

      this.logger.log(
        `Saved Grafana datasource UIDs to cluster ${clusterId} metadata`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save Grafana datasource UIDs for cluster ${clusterId}: ${error.message}`,
      );
      // Don't throw - this is not critical, datasources are already created
    }
  }
}
