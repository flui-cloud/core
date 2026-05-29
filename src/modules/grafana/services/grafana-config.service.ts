import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ClusterEntity,
  ClusterType,
  ClusterStatus,
} from '../../infrastructure/clusters/entities/cluster.entity';
import { buildSystemNipHostname } from '../../dns/utils/nip-hostname.util';

/**
 * Service for retrieving Grafana configuration and credentials
 * This service breaks the circular dependency by directly querying the clusters table
 * instead of depending on ControlClusterService
 */
@Injectable()
export class GrafanaConfigService {
  private readonly logger = new Logger(GrafanaConfigService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get Grafana URL and credentials from control cluster metadata
   * @returns Grafana endpoint URL, username, and admin password
   */
  async getGrafanaCredentials(): Promise<{
    url: string;
    username: string;
    password: string;
  }> {
    const obsCluster = await this.getControlCluster();

    if (!obsCluster) {
      throw new Error(
        'No control cluster found - cannot manage Grafana datasources',
      );
    }

    // Get Grafana endpoint and password from cluster metadata
    const endpoints = obsCluster.metadata?.observabilityStack?.endpoints;
    const passwords = obsCluster.metadata?.observabilityStack?.passwords;

    // PRIORITY 1: Try metadata first (for API-created clusters)
    if (endpoints?.grafana && passwords?.grafana) {
      return {
        url: endpoints.grafana,
        username: 'admin', // API-created clusters always use 'admin'
        password: passwords.grafana,
      };
    }

    // PRIORITY 2: Try environment variables (complete configuration)
    const envGrafanaUrl = this.configService.get<string>('GRAFANA_URL');
    const envGrafanaUsername = this.configService.get<string>(
      'GRAFANA_ADMIN_USERNAME',
    );
    const envGrafanaPassword = this.configService.get<string>(
      'GRAFANA_ADMIN_PASSWORD',
    );

    // If GRAFANA_URL is provided, use env vars for complete configuration
    if (envGrafanaUrl) {
      this.logger.log(
        'Control cluster metadata missing. Using GRAFANA_URL from environment variables.',
      );

      // Validate URL format
      if (
        !envGrafanaUrl.startsWith('http://') &&
        !envGrafanaUrl.startsWith('https://')
      ) {
        throw new Error(
          'GRAFANA_URL must start with http:// or https://. ' +
            `Received: ${envGrafanaUrl}`,
        );
      }

      if (!envGrafanaPassword) {
        throw new Error(
          'GRAFANA_ADMIN_PASSWORD environment variable not set. ' +
            'This is required when using GRAFANA_URL. ' +
            'Please set this variable and restart the application.',
        );
      }

      const username = envGrafanaUsername || 'admin'; // Default to 'admin' if not specified

      this.logger.log(
        `Using environment variables: ${envGrafanaUrl} (username: ${username})`,
      );

      return {
        url: envGrafanaUrl,
        username,
        password: envGrafanaPassword,
      };
    }

    // PRIORITY 3: FALLBACK - Construct URL from cluster IP + use env vars for credentials
    this.logger.warn(
      'Control cluster metadata missing Grafana credentials. ' +
        'Using fallback: cluster IP + environment variables for credentials',
    );

    if (!obsCluster.masterIpAddress) {
      throw new Error(
        'Control cluster missing master IP address. ' +
          'Cannot construct Grafana endpoint URL. ' +
          'Please set GRAFANA_URL environment variable or ensure cluster has masterIpAddress.',
      );
    }

    if (!envGrafanaPassword) {
      throw new Error(
        'GRAFANA_ADMIN_PASSWORD environment variable not set. ' +
          'This is required for CLI-created control clusters. ' +
          'Please set this variable and restart the application.',
      );
    }

    const grafanaUrl = `http://${buildSystemNipHostname('grafana', obsCluster.masterIpAddress, obsCluster.nipHostnameToken)}`;
    const username = envGrafanaUsername || 'admin'; // Default to 'admin' if not specified

    this.logger.log(
      `Using fallback credentials: ${grafanaUrl} (username: ${username}, password from env)`,
    );

    return {
      url: grafanaUrl,
      username,
      password: envGrafanaPassword,
    };
  }

  /**
   * Get the control cluster entity
   * @returns control cluster entity or null if not found
   */
  async getControlCluster(): Promise<ClusterEntity | null> {
    try {
      const obsCluster = await this.clusterRepository.findOne({
        where: {
          clusterType: In([ClusterType.CONTROL, ClusterType.OBSERVABILITY]),
          status: ClusterStatus.READY,
        },
        order: { createdAt: 'DESC' },
      });

      if (!obsCluster) {
        this.logger.warn('No READY control cluster found in database');
        return null;
      }

      this.logger.log(
        `Found control cluster: ${obsCluster.name} (${obsCluster.id})`,
      );
      return obsCluster;
    } catch (error) {
      this.logger.error(
        `Error retrieving control cluster: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Get Grafana endpoint URL
   * @returns Grafana HTTP endpoint (e.g., "http://1.2.3.4:30300")
   */
  async getGrafanaEndpoint(): Promise<string | null> {
    try {
      const credentials = await this.getGrafanaCredentials();
      return credentials.url;
    } catch (error) {
      this.logger.warn(`Failed to get Grafana endpoint: ${error.message}`);
      return null;
    }
  }

  /**
   * Get Grafana admin password
   * @returns Grafana admin password
   */
  async getGrafanaPassword(): Promise<string | null> {
    try {
      const credentials = await this.getGrafanaCredentials();
      return credentials.password;
    } catch (error) {
      this.logger.warn(`Failed to get Grafana password: ${error.message}`);
      return null;
    }
  }

  /**
   * Get Basic Auth header for Grafana API
   * @returns Base64 encoded Basic Auth credentials
   */
  async getGrafanaAuthHeader(): Promise<string | null> {
    try {
      const credentials = await this.getGrafanaCredentials();
      const auth = Buffer.from(`admin:${credentials.password}`).toString(
        'base64',
      );
      return `Basic ${auth}`;
    } catch (error) {
      this.logger.warn(`Failed to get Grafana auth header: ${error.message}`);
      return null;
    }
  }
}
