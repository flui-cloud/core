import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {
  ClusterEntity,
  ClusterStatus,
  ClusterType,
} from '../clusters/entities/cluster.entity';
import { K3S_DEFAULT_VERSION } from '../clusters/constants';
import { ClustersService } from '../clusters/clusters.service';
import { KubernetesService } from '../shared/services/kubernetes.service';
import { GrafanaDatasourceService } from 'src/modules/grafana/services/grafana-datasource.service';

export interface ObservabilityEndpoints {
  prometheus?: string;
  loki?: string;
  grafana?: string;
  postgres?: string;
  redis?: string;
  fluiApi?: string;
}

export interface ObservabilityStackConfig {
  postgresPassword: string;
  redisPassword: string;
  grafanaPassword: string;
  fluiApiImage: string;
  storageSize?: string;
}

@Injectable()
export class ObservabilityClusterService {
  private readonly logger = new Logger(ObservabilityClusterService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly clustersService: ClustersService,
    private readonly kubernetesService: KubernetesService,
    private readonly grafanaDatasourceService: GrafanaDatasourceService,
  ) {}

  /**
   * Create observability cluster
   */
  async createObservabilityCluster(
    provider: string,
    region: string,
    nodeSize: string,
    workerCount: number = 0,
  ): Promise<string> {
    this.logger.log('Creating observability cluster...');

    // Check if observability cluster already exists
    // Use getObservabilityCluster() for consistent lookup logic
    const existing = await this.getObservabilityCluster();

    if (existing && existing.status !== ClusterStatus.DELETED) {
      throw new Error(
        'Observability cluster already exists. Delete it first before creating a new one.',
      );
    }

    // Create cluster via ClustersService (returns operation, not cluster)
    const operation = await this.clustersService.createCluster({
      name: 'flui-observability',
      provider: provider as any, // CloudProvider enum
      region,
      nodeSize,
      workerCount,
      k3sVersion: K3S_DEFAULT_VERSION,
      metadata: {
        purpose: 'observability',
      },
    });

    this.logger.log(
      `Observability cluster creation started: operation ${operation.id}`,
    );
    // Return the cluster ID from operation metadata or resourceId
    return operation.resourceId || operation.metadata?.clusterId;
  }

  /**
   * Deploy observability stack to cluster
   */
  async deployObservabilityStack(
    clusterId: string,
    config?: Partial<ObservabilityStackConfig>,
  ): Promise<ObservabilityEndpoints> {
    this.logger.log(`Deploying observability stack to cluster ${clusterId}...`);

    // Get cluster
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    if (cluster.status !== ClusterStatus.READY) {
      throw new Error(
        `Cluster ${clusterId} is not ready. Current status: ${cluster.status}`,
      );
    }

    // Get kubeconfig
    const kubeconfig = await this.clustersService.getKubeconfig(clusterId);
    if (!kubeconfig) {
      throw new Error(`Kubeconfig not available for cluster ${clusterId}`);
    }

    // Generate passwords if not provided
    const stackConfig: ObservabilityStackConfig = {
      postgresPassword:
        config?.postgresPassword || this.generateSecurePassword(),
      redisPassword: config?.redisPassword || this.generateSecurePassword(),
      grafanaPassword: config?.grafanaPassword || this.generateSecurePassword(),
      fluiApiImage: config?.fluiApiImage || 'ghcr.io/flui-cloud/core:latest',
      storageSize: config?.storageSize || '10Gi',
    };

    this.logger.log('Stack configuration prepared');

    // Deploy manifests in order
    const manifests = [
      'namespace',
      'postgres',
      'redis',
      'prometheus',
      'loki',
      'grafana',
      // 'flui-api', // Skip for now, will be added in future
    ];

    for (const manifestName of manifests) {
      this.logger.log(`Deploying ${manifestName}...`);
      const yaml = this.renderTemplate(manifestName, stackConfig);
      await this.kubernetesService.applyManifest(kubeconfig, yaml);
      this.logger.log(`${manifestName} deployed successfully`);
    }

    // Wait for all pods to be ready
    await this.waitForStackReady(kubeconfig);

    // Get public endpoints
    const endpoints = await this.getObservabilityEndpoints(
      clusterId,
      kubeconfig,
    );

    // Update cluster metadata with endpoints and passwords
    cluster.metadata = {
      ...cluster.metadata,
      observabilityStack: {
        deployed: true,
        deployedAt: new Date().toISOString(),
        endpoints,
        passwords: {
          postgres: stackConfig.postgresPassword,
          redis: stackConfig.redisPassword,
          grafana: stackConfig.grafanaPassword,
        },
      },
    };
    await this.clusterRepository.save(cluster);

    // Create centralized Loki datasource in Grafana
    // This datasource is shared across all workload clusters
    try {
      await this.grafanaDatasourceService.createCentralizedLokiDatasource();
      this.logger.log('Centralized Loki datasource created in Grafana');
    } catch (error) {
      this.logger.warn(
        `Failed to create centralized Loki datasource: ${error.message}`,
      );
      // Don't fail the deployment if Grafana datasource creation fails
      // The stack is still functional without it
    }

    this.logger.log('Observability stack deployed successfully');
    return endpoints;
  }

  /**
   * Get observability endpoints
   */
  async getObservabilityEndpoints(
    clusterId: string,
    kubeconfigContent?: string,
  ): Promise<ObservabilityEndpoints> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    const kubeconfig =
      kubeconfigContent ||
      (await this.clustersService.getKubeconfig(clusterId));
    if (!kubeconfig) {
      throw new Error(`Kubeconfig not available for cluster ${clusterId}`);
    }

    // Get NodePort services
    const prometheusService = await this.kubernetesService.getResource(
      kubeconfig,
      'Service',
      'prometheus',
      'flui-observability',
    );
    const grafanaService = await this.kubernetesService.getResource(
      kubeconfig,
      'Service',
      'grafana',
      'flui-observability',
    );
    const lokiService = await this.kubernetesService.getResource(
      kubeconfig,
      'Service',
      'loki',
      'flui-observability',
    );
    const postgresService = await this.kubernetesService.getResource(
      kubeconfig,
      'Service',
      'postgres',
      'flui-system',
    );
    const redisService = await this.kubernetesService.getResource(
      kubeconfig,
      'Service',
      'redis',
      'flui-system',
    );

    const masterIp = cluster.masterPrivateIp ?? cluster.masterIpAddress;
    const endpoints: ObservabilityEndpoints = {};

    if (prometheusService && masterIp) {
      const prometheusNodePort = prometheusService.spec?.ports?.[0]?.nodePort;
      if (prometheusNodePort) {
        endpoints.prometheus = `http://${masterIp}:${prometheusNodePort}`;
      }
    }

    if (grafanaService && masterIp) {
      const grafanaNodePort = grafanaService.spec?.ports?.[0]?.nodePort;
      if (grafanaNodePort) {
        endpoints.grafana = `http://${masterIp}:${grafanaNodePort}`;
      }
    }

    if (lokiService && masterIp) {
      const lokiNodePort = lokiService.spec?.ports?.[0]?.nodePort;
      if (lokiNodePort) {
        endpoints.loki = `http://${masterIp}:${lokiNodePort}`;
      }
    }

    if (postgresService && masterIp) {
      const postgresNodePort = postgresService.spec?.ports?.[0]?.nodePort;
      if (postgresNodePort) {
        endpoints.postgres = `http://${masterIp}:${postgresNodePort}`;
      }
    }

    if (redisService && masterIp) {
      const redisNodePort = redisService.spec?.ports?.[0]?.nodePort;
      if (redisNodePort) {
        endpoints.redis = `http://${masterIp}:${redisNodePort}`;
      }
    }

    return endpoints;
  }

  /**
   * Delete observability cluster
   */
  async deleteObservabilityCluster(clusterId: string): Promise<void> {
    this.logger.log(`Deleting observability cluster ${clusterId}...`);

    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    if (cluster.metadata?.purpose !== 'observability') {
      throw new Error(`Cluster ${clusterId} is not an observability cluster`);
    }

    await this.clustersService.deleteCluster(clusterId);
    this.logger.log(`Observability cluster ${clusterId} deleted`);
  }

  /**
   * Get observability cluster
   */
  async getObservabilityCluster(): Promise<ClusterEntity | null> {
    // First try to find by clusterType (new standard way)
    const clusterByType = await this.clusterRepository.findOne({
      where: {
        clusterType: ClusterType.OBSERVABILITY,
      },
      relations: ['nodes'],
    });

    if (clusterByType) {
      return clusterByType;
    }

    // Fallback to legacy metadata.purpose for backward compatibility
    return await this.clusterRepository.findOne({
      where: {
        metadata: Raw((alias) => `${alias} ->> 'purpose' = :purpose`, {
          purpose: 'observability',
        }),
      },
      relations: ['nodes'],
    });
  }

  // Private helper methods

  private renderTemplate(
    templateName: string,
    config: ObservabilityStackConfig,
  ): string {
    const templatePath = path.join(
      process.cwd(),
      'cli',
      'templates',
      'k8s',
      `${templateName}.yaml.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(config);
  }

  private generateSecurePassword(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  private async waitForStackReady(kubeconfig: string): Promise<void> {
    this.logger.log('Waiting for stack to be ready...');

    const resources = [
      { kind: 'StatefulSet', name: 'postgres', namespace: 'flui-system' },
      { kind: 'Deployment', name: 'redis', namespace: 'flui-system' },
      {
        kind: 'Deployment',
        name: 'prometheus',
        namespace: 'flui-observability',
      },
      { kind: 'Deployment', name: 'loki', namespace: 'flui-observability' },
      { kind: 'Deployment', name: 'grafana', namespace: 'flui-observability' },
    ];

    for (const resource of resources) {
      try {
        this.logger.log(
          `Waiting for ${resource.kind}/${resource.name} to be ready...`,
        );
        await this.kubernetesService.waitForReady(
          kubeconfig,
          resource.kind,
          resource.name,
          resource.namespace,
          600000, // 10 minutes timeout
        );
        this.logger.log(`${resource.kind}/${resource.name} is ready`);
      } catch (error) {
        this.logger.error(
          `Failed to wait for ${resource.kind}/${resource.name}: ${error.message}`,
        );
        throw error;
      }
    }

    this.logger.log('All stack components are ready');
  }
}
