import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClusterEntity,
  ClusterType,
} from '../../clusters/entities/cluster.entity';
import { ClusterAuthzInstallRepository } from '../../../authz/repositories/cluster-authz-install.repository';
import { KubernetesService } from '../../shared/services/kubernetes.service';
import { EncryptionService } from '../../../shared/encryption/services/encryption.service';
import {
  PLATFORM_COMPONENTS_CATALOG,
  PlatformComponentDefinition,
  PlatformComponentResourceDefinition,
} from '../constants/platform-components.catalog';
import {
  PlatformComponentConditionDto,
  PlatformComponentLogsResponseDto,
  PlatformComponentPodIssueDto,
  PlatformComponentPodStatusDto,
  PlatformComponentReplicaStatusDto,
  PlatformComponentResourceStatusDto,
  PlatformComponentResponseDto,
  RedeployPlatformComponentResponseDto,
} from '../dto/platform-components.dto';

type ComponentHealth = 'healthy' | 'degraded' | 'missing';

interface ResourceAssessment {
  resource: PlatformComponentResourceStatusDto;
  errors: string[];
}

interface PodInspectionResult {
  pods: PlatformComponentPodStatusDto[];
  issues: PlatformComponentPodIssueDto[];
}

@Injectable()
export class PlatformComponentsService {
  private readonly logger = new Logger(PlatformComponentsService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly kubernetesService: KubernetesService,
    private readonly encryptionService: EncryptionService,
    private readonly authzInstallRepo: ClusterAuthzInstallRepository,
  ) {}

  async listComponents(
    clusterId: string,
  ): Promise<PlatformComponentResponseDto[]> {
    const { cluster, kubeconfig } =
      await this.resolveClusterAndKubeconfig(clusterId);
    const authMode = await this.readAuthMode(kubeconfig);
    const authzInstall =
      await this.authzInstallRepo.findRunningForCluster(clusterId);
    const definitions = this.getCatalogForClusterType(
      cluster.clusterType,
      authMode,
      !!authzInstall,
    );

    return Promise.all(
      definitions.map((definition) =>
        this.buildComponentStatus(kubeconfig, definition),
      ),
    );
  }

  async getComponent(
    clusterId: string,
    componentKey: string,
  ): Promise<PlatformComponentResponseDto> {
    const { cluster, kubeconfig } =
      await this.resolveClusterAndKubeconfig(clusterId);
    const authMode = await this.readAuthMode(kubeconfig);
    const authzInstall =
      await this.authzInstallRepo.findRunningForCluster(clusterId);
    const definition = this.getComponentDefinition(
      componentKey,
      cluster.clusterType,
      authMode,
      !!authzInstall,
    );

    return this.buildComponentStatus(kubeconfig, definition);
  }

  async redeployComponent(
    clusterId: string,
    componentKey: string,
  ): Promise<RedeployPlatformComponentResponseDto> {
    const { cluster, kubeconfig } =
      await this.resolveClusterAndKubeconfig(clusterId);
    const authMode = await this.readAuthMode(kubeconfig);
    const authzInstall =
      await this.authzInstallRepo.findRunningForCluster(clusterId);
    const definition = this.getComponentDefinition(
      componentKey,
      cluster.clusterType,
      authMode,
      !!authzInstall,
    );

    const restartedResources: string[] = [];
    const missingResources: string[] = [];
    const skippedResources: string[] = [];
    const executedAt = new Date().toISOString();

    for (const resourceDef of definition.resources) {
      if (!resourceDef.workload) {
        skippedResources.push(
          `${resourceDef.kind}/${resourceDef.name} (not restartable)`,
        );
        continue;
      }

      const id = `${resourceDef.kind}/${resourceDef.name}`;
      const resource = await this.kubernetesService.getResource(
        kubeconfig,
        resourceDef.kind,
        resourceDef.name,
        resourceDef.namespace,
      );

      if (!resource) {
        missingResources.push(id);
        continue;
      }

      try {
        const restartManifest = this.buildRollingRestartManifest(
          resource,
          executedAt,
        );
        await this.kubernetesService.applyManifest(kubeconfig, restartManifest);
        restartedResources.push(id);
      } catch (error) {
        const message = error?.message ?? String(error);
        skippedResources.push(`${id} (${message})`);
      }
    }

    let result: 'ok' | 'partial' | 'skipped' = 'ok';
    if (restartedResources.length === 0) {
      result = 'skipped';
    } else if (missingResources.length > 0 || skippedResources.length > 0) {
      result = 'partial';
    }

    let message: string;
    if (result === 'ok') {
      message = `Restarted ${restartedResources.length} workload resource(s)`;
    } else if (result === 'partial') {
      message = `Restarted ${restartedResources.length} resource(s), with ${missingResources.length + skippedResources.length} issue(s)`;
    } else {
      message = 'No workload resources were restarted';
    }

    return {
      componentKey: definition.key,
      restartedResources,
      missingResources,
      skippedResources,
      result,
      message,
      executedAt,
    };
  }

  async getPodLogs(
    clusterId: string,
    componentKey: string,
    podName: string,
    container?: string,
    tailLines: number = 200,
  ): Promise<PlatformComponentLogsResponseDto> {
    const { cluster, kubeconfig } =
      await this.resolveClusterAndKubeconfig(clusterId);
    const authMode = await this.readAuthMode(kubeconfig);
    const authzInstall =
      await this.authzInstallRepo.findRunningForCluster(clusterId);
    const definition = this.getComponentDefinition(
      componentKey,
      cluster.clusterType,
      authMode,
      !!authzInstall,
    );

    const pods = await this.getComponentPods(kubeconfig, definition);
    const pod = pods.find((p) => p.metadata?.name === podName);
    if (!pod) {
      throw new NotFoundException(
        `Pod ${podName} not found for component ${componentKey}`,
      );
    }

    const namespace = pod.metadata?.namespace || 'default';
    const logs = await this.kubernetesService.getPodLogs(
      kubeconfig,
      podName,
      namespace,
      container,
      tailLines,
    );

    return {
      componentKey,
      podName,
      namespace,
      container,
      tailLines,
      logs,
    };
  }

  private async buildComponentStatus(
    kubeconfig: string,
    definition: PlatformComponentDefinition,
  ): Promise<PlatformComponentResponseDto> {
    const assessments = await Promise.all(
      definition.resources.map((resourceDef) =>
        this.buildResourceAssessment(kubeconfig, resourceDef),
      ),
    );

    const resources = assessments.map((r) => r.resource);
    const errorsSet = new Set<string>(
      assessments.flatMap((assessment) => assessment.errors),
    );

    const status = this.computeComponentStatus(resources);
    const restartSupported = resources.some(
      (r) => r.restartSupported && r.exists,
    );

    return {
      key: definition.key,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      managedBy: definition.managedBy,
      status,
      restartSupported,
      errorCount: errorsSet.size,
      errors: Array.from(errorsSet),
      resources,
      checkedAt: new Date().toISOString(),
    };
  }

  private async buildResourceAssessment(
    kubeconfig: string,
    resourceDef: PlatformComponentResourceDefinition,
  ): Promise<ResourceAssessment> {
    const identifier = `${resourceDef.kind}/${resourceDef.name}`;
    const errors: string[] = [];

    try {
      const resource = await this.kubernetesService.getResource(
        kubeconfig,
        resourceDef.kind,
        resourceDef.name,
        resourceDef.namespace,
      );

      if (!resource) {
        if (resourceDef.optional) {
          return {
            resource: {
              kind: resourceDef.kind,
              name: resourceDef.name,
              namespace: resourceDef.namespace,
              exists: false,
              status: 'healthy',
              restartSupported: Boolean(resourceDef.workload),
            },
            errors: [],
          };
        }

        return {
          resource: {
            kind: resourceDef.kind,
            name: resourceDef.name,
            namespace: resourceDef.namespace,
            exists: false,
            status: 'missing',
            restartSupported: Boolean(resourceDef.workload),
          },
          errors: [
            `${identifier} not found in namespace ${resourceDef.namespace}`,
          ],
        };
      }

      const conditions = this.extractConditions(resource);
      const conditionErrors = this.extractConditionErrors(
        identifier,
        conditions,
      );
      errors.push(...conditionErrors);

      const result: PlatformComponentResourceStatusDto = {
        kind: resourceDef.kind,
        name: resourceDef.name,
        namespace: resourceDef.namespace,
        exists: true,
        status: 'healthy',
        restartSupported: Boolean(resourceDef.workload),
        createdAt: resource?.metadata?.creationTimestamp,
        conditions,
      };

      if (resourceDef.workload) {
        const detail = await this.kubernetesService.getResourceDetail(
          kubeconfig,
          resourceDef.kind,
          resourceDef.name,
          resourceDef.namespace,
        );

        const replicas: PlatformComponentReplicaStatusDto =
          detail?.replicas || {};
        result.replicas = replicas;

        if (!this.isWorkloadReady(resourceDef.kind, replicas)) {
          result.status = 'degraded';
          errors.push(
            `${identifier} not ready (${replicas.ready ?? 0}/${replicas.desired ?? 0})`,
          );
        }

        const podInspection = await this.listPodsAndIssues(
          kubeconfig,
          resourceDef.namespace,
          resource?.spec?.selector?.matchLabels,
          resourceDef.kind,
          resourceDef.name,
          replicas.desired,
        );
        result.pods = podInspection.pods;
        result.podIssues = podInspection.issues;

        if (podInspection.issues.length > 0) {
          result.status = 'degraded';
          errors.push(
            ...podInspection.issues.map((issue) => {
              const container = issue.containerName
                ? `/${issue.containerName}`
                : '';
              const msg = issue.message ? ` - ${issue.message}` : '';
              return `${issue.podName}${container}: ${issue.reason || issue.phase}${msg}`;
            }),
          );
        }
      }

      if (conditionErrors.length > 0 && result.status === 'healthy') {
        result.status = 'degraded';
      }

      return { resource: result, errors };
    } catch (error) {
      const message = error?.message ?? String(error);
      this.logger.warn(`Failed to inspect ${identifier}: ${message}`);

      return {
        resource: {
          kind: resourceDef.kind,
          name: resourceDef.name,
          namespace: resourceDef.namespace,
          exists: true,
          status: 'degraded',
          restartSupported: Boolean(resourceDef.workload),
        },
        errors: [`${identifier}: ${message}`],
      };
    }
  }

  private async listPodsAndIssues(
    kubeconfig: string,
    namespace: string,
    matchLabels?: Record<string, string>,
    workloadKind?: string,
    workloadName?: string,
    desiredReplicas?: number,
  ): Promise<PodInspectionResult> {
    const labelSelector = this.toLabelSelector(matchLabels);
    const pods = labelSelector
      ? await this.kubernetesService.listResources(
          kubeconfig,
          'Pod',
          namespace,
          labelSelector,
        )
      : [];

    const podStatuses: PlatformComponentPodStatusDto[] = [];
    const issues: PlatformComponentPodIssueDto[] = [];
    for (const pod of pods) {
      const podName = pod.metadata?.name || '';
      const phase = pod.status?.phase || 'Unknown';
      podStatuses.push(this.extractPodStatus(pod, namespace));

      if (phase === 'Failed' || phase === 'Pending') {
        issues.push({
          podName,
          namespace,
          phase,
          reason: pod.status?.reason,
          message: pod.status?.message,
        });
      }

      const initContainerStatuses = pod.status?.initContainerStatuses || [];
      const regularContainerStatuses = pod.status?.containerStatuses || [];
      const containerStatuses = [
        ...initContainerStatuses.map((containerStatus) => ({
          containerStatus,
          isInit: true,
        })),
        ...regularContainerStatuses.map((containerStatus) => ({
          containerStatus,
          isInit: false,
        })),
      ];

      for (const { containerStatus, isInit } of containerStatuses) {
        const containerName = containerStatus.name;
        const restartCount = containerStatus.restartCount || 0;

        if (containerStatus.state?.waiting) {
          const reason = containerStatus.state.waiting.reason;
          if (
            reason &&
            reason !== 'ContainerCreating' &&
            reason !== 'PodInitializing'
          ) {
            issues.push({
              podName,
              namespace,
              phase,
              containerName,
              reason,
              message: containerStatus.state.waiting.message,
              restartCount,
            });
          }
        }

        if (containerStatus.state?.terminated) {
          const terminated = containerStatus.state.terminated;
          const reason = terminated.reason || '';
          const failedTermination =
            terminated.exitCode !== 0 ||
            [
              'Error',
              'OOMKilled',
              'ContainerCannotRun',
              'DeadlineExceeded',
            ].includes(reason);

          // Completed init containers are expected and should not be flagged.
          if (!failedTermination || (isInit && reason === 'Completed')) {
            continue;
          }

          if (failedTermination) {
            issues.push({
              podName,
              namespace,
              phase,
              containerName,
              reason: reason || 'Terminated',
              message: terminated.message,
              restartCount,
            });
          }
        }

        if (restartCount > 3 && !containerStatus.ready) {
          issues.push({
            podName,
            namespace,
            phase,
            containerName,
            reason: 'FrequentRestarts',
            message: `Container restarted ${restartCount} times`,
            restartCount,
          });
        }
      }
    }

    const missingPodNames = this.computeMissingPodNames(
      workloadKind,
      workloadName,
      desiredReplicas,
      pods,
    );
    for (const podName of missingPodNames) {
      podStatuses.push({
        podName,
        namespace,
        phase: 'Missing',
        missing: true,
        ready: false,
        reason: 'MissingPod',
        message: `Expected pod for ${workloadKind}/${workloadName} is missing`,
      });
      issues.push({
        podName,
        namespace,
        phase: 'Missing',
        reason: 'MissingPod',
        message: `Expected pod for ${workloadKind}/${workloadName} is missing`,
      });
    }

    return {
      pods: this.deduplicatePodStatuses(podStatuses),
      issues: this.deduplicatePodIssues(issues),
    };
  }

  private extractPodStatus(
    pod: any,
    fallbackNamespace: string,
  ): PlatformComponentPodStatusDto {
    const namespace = pod.metadata?.namespace || fallbackNamespace;
    const podName = pod.metadata?.name || '';
    const phase = pod.status?.phase || 'Unknown';
    const conditions = pod.status?.conditions || [];
    const readyCondition = conditions.find((c: any) => c.type === 'Ready');
    const ready =
      readyCondition == null ? undefined : readyCondition.status === 'True';

    const statuses = [
      ...(pod.status?.initContainerStatuses || []),
      ...(pod.status?.containerStatuses || []),
    ];
    const restartCount = statuses.reduce(
      (sum: number, status: any) => sum + (status.restartCount || 0),
      0,
    );

    let reason = pod.status?.reason;
    let message = pod.status?.message;
    if (!reason) {
      const waiting = statuses.find((s: any) => s.state?.waiting);
      const terminated = statuses.find((s: any) => s.state?.terminated);
      reason =
        waiting?.state?.waiting?.reason ||
        terminated?.state?.terminated?.reason;
      message =
        waiting?.state?.waiting?.message ||
        terminated?.state?.terminated?.message;
    }

    return {
      podName,
      namespace,
      phase,
      ready,
      restartCount,
      reason,
      message,
      missing: false,
    };
  }

  private computeMissingPodNames(
    workloadKind: string | undefined,
    workloadName: string | undefined,
    desiredReplicas: number | undefined,
    pods: any[],
  ): string[] {
    if (!workloadKind || !workloadName) {
      return [];
    }

    const desired = desiredReplicas ?? 0;
    if (desired <= 0) {
      return [];
    }

    const existingPodNames = new Set(
      pods.map((pod) => pod.metadata?.name).filter(Boolean),
    );

    if (workloadKind === 'StatefulSet') {
      const missing: string[] = [];
      for (let i = 0; i < desired; i++) {
        const expectedPodName = `${workloadName}-${i}`;
        if (!existingPodNames.has(expectedPodName)) {
          missing.push(expectedPodName);
        }
      }
      return missing;
    }

    const missingCount = Math.max(0, desired - existingPodNames.size);
    return Array.from(
      { length: missingCount },
      (_, i) => `missing-${workloadName}-${i + 1}`,
    );
  }

  private deduplicatePodIssues(
    issues: PlatformComponentPodIssueDto[],
  ): PlatformComponentPodIssueDto[] {
    const map = new Map<string, PlatformComponentPodIssueDto>();
    for (const issue of issues) {
      const key = [
        issue.podName,
        issue.containerName || '',
        issue.reason || '',
        issue.message || '',
      ].join('|');
      if (!map.has(key)) {
        map.set(key, issue);
      }
    }
    return Array.from(map.values());
  }

  private deduplicatePodStatuses(
    pods: PlatformComponentPodStatusDto[],
  ): PlatformComponentPodStatusDto[] {
    const map = new Map<string, PlatformComponentPodStatusDto>();
    for (const pod of pods) {
      const key = `${pod.namespace}/${pod.podName}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, pod);
        continue;
      }

      // Prefer real pods over synthetic "missing-*" placeholders.
      if (existing.missing && !pod.missing) {
        map.set(key, pod);
      }
    }
    return Array.from(map.values());
  }

  private extractConditions(resource: any): PlatformComponentConditionDto[] {
    const conditions = resource?.status?.conditions || [];
    return conditions.map((condition: any) => ({
      type: condition.type,
      status: condition.status,
      reason: condition.reason,
      message: condition.message,
      lastTransitionTime: condition.lastTransitionTime,
    }));
  }

  private extractConditionErrors(
    identifier: string,
    conditions: PlatformComponentConditionDto[],
  ): string[] {
    return conditions
      .filter(
        (condition) =>
          condition.status === 'False' &&
          ['Available', 'Ready', 'Progressing'].includes(condition.type),
      )
      .map((condition) => {
        const reason = condition.reason ? ` (${condition.reason})` : '';
        const message = condition.message ? `: ${condition.message}` : '';
        return `${identifier} condition ${condition.type}=${condition.status}${reason}${message}`;
      });
  }

  private isWorkloadReady(
    kind: string,
    replicas: PlatformComponentReplicaStatusDto,
  ): boolean {
    const desired = replicas.desired ?? 0;
    const ready = replicas.ready ?? 0;

    if (kind === 'DaemonSet') {
      return desired === 0 ? true : ready >= desired;
    }

    if (kind === 'Deployment' || kind === 'StatefulSet') {
      return desired === 0 ? true : ready >= desired;
    }

    return true;
  }

  private computeComponentStatus(
    resources: PlatformComponentResourceStatusDto[],
  ): ComponentHealth {
    if (resources.some((r) => r.status === 'missing')) {
      return 'missing';
    }
    if (resources.some((r) => r.status === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  private buildRollingRestartManifest(
    resource: any,
    executedAt: string,
  ): string {
    const manifest = structuredClone(resource || {}) as any;

    manifest.spec = manifest.spec || {};
    manifest.spec.template = manifest.spec.template || {};
    manifest.spec.template.metadata = manifest.spec.template.metadata || {};
    manifest.spec.template.metadata.annotations = {
      ...manifest.spec.template.metadata.annotations,
      'kubectl.kubernetes.io/restartedAt': executedAt,
      'flui.cloud/fix-triggered-at': executedAt,
    };

    manifest.metadata = manifest.metadata || {};
    delete manifest.metadata.resourceVersion;
    delete manifest.metadata.uid;
    delete manifest.metadata.creationTimestamp;
    delete manifest.metadata.generation;
    delete manifest.metadata.managedFields;
    delete manifest.status;

    return JSON.stringify(manifest);
  }

  private async getComponentPods(
    kubeconfig: string,
    definition: PlatformComponentDefinition,
  ): Promise<any[]> {
    const pods: any[] = [];
    for (const resourceDef of definition.resources) {
      if (!resourceDef.workload) continue;

      const resource = await this.kubernetesService.getResource(
        kubeconfig,
        resourceDef.kind,
        resourceDef.name,
        resourceDef.namespace,
      );
      if (!resource?.spec?.selector?.matchLabels) continue;

      const labelSelector = this.toLabelSelector(
        resource.spec.selector.matchLabels,
      );
      if (!labelSelector) continue;

      const workloadPods = await this.kubernetesService.listResources(
        kubeconfig,
        'Pod',
        resourceDef.namespace,
        labelSelector,
      );
      pods.push(...workloadPods);
    }

    return pods;
  }

  private toLabelSelector(labels?: Record<string, string>): string | undefined {
    if (!labels || Object.keys(labels).length === 0) {
      return undefined;
    }
    return Object.entries(labels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
  }

  private async readAuthMode(kubeconfig: string): Promise<string> {
    try {
      const configMap = await this.kubernetesService.getResource(
        kubeconfig,
        'ConfigMap',
        'flui-api-config',
        'flui-system',
      );
      const cmBody = configMap?.body ?? configMap;
      return cmBody?.data?.['AUTH_MODE'] ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getCatalogForClusterType(
    clusterType: ClusterType,
    authMode?: string,
    hasAuthzInstall?: boolean,
  ): PlatformComponentDefinition[] {
    return PLATFORM_COMPONENTS_CATALOG.filter((component) => {
      if (!component.clusterTypes.includes(clusterType)) return false;
      if (component.requiredAuthMode && authMode !== component.requiredAuthMode)
        return false;
      if (component.requiredAuthzInstall && !hasAuthzInstall) return false;
      return true;
    });
  }

  private getComponentDefinition(
    componentKey: string,
    clusterType: ClusterType,
    authMode?: string,
    hasAuthzInstall?: boolean,
  ): PlatformComponentDefinition {
    const definition = this.getCatalogForClusterType(
      clusterType,
      authMode,
      hasAuthzInstall,
    ).find((component) => component.key === componentKey);
    if (!definition) {
      throw new NotFoundException(
        `Platform component ${componentKey} not found for cluster type ${clusterType}`,
      );
    }
    return definition;
  }

  private async resolveClusterAndKubeconfig(clusterId: string): Promise<{
    cluster: ClusterEntity;
    kubeconfig: string;
  }> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }
    if (!cluster.kubeconfigEncrypted) {
      throw new NotFoundException(`Cluster ${clusterId} has no kubeconfig`);
    }

    return {
      cluster,
      kubeconfig: this.encryptionService.decrypt(cluster.kubeconfigEncrypted),
    };
  }
}
