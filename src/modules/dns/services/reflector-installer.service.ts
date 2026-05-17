import { Injectable, Logger } from '@nestjs/common';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';

/**
 * Installs kubernetes-reflector (emberstack) on a target cluster. Reflector
 * watches a source Secret carrying `reflector.v1.k8s.emberstack.com/reflection-allowed`
 * and fills placeholder Secrets in other namespaces that declare a
 * `reflects: <ns>/<name>` annotation. We use it to propagate the wildcard
 * TLS Secret from `flui-system` into each app namespace.
 *
 * Installation is idempotent: `ensureInstalled` can be called on every
 * `ensureForCluster` invocation with negligible cost after the first run.
 */
@Injectable()
export class ReflectorInstallerService {
  private readonly logger = new Logger(ReflectorInstallerService.name);
  private static readonly VERSION = 'v9.1.36';
  private static readonly MANIFEST_URL = `https://github.com/emberstack/kubernetes-reflector/releases/download/${ReflectorInstallerService.VERSION}/reflector.yaml`;
  private static readonly DEPLOYMENT_NAME = 'reflector';
  private static readonly DEPLOYMENT_NAMESPACE = 'kube-system';
  private static readonly READY_TIMEOUT_MS = 3 * 60 * 1000;
  private static readonly POLL_INTERVAL_MS = 3000;

  private manifestCache: string | null = null;

  constructor(private readonly kubernetesService: KubernetesService) {}

  async ensureInstalled(kubeconfig: string): Promise<void> {
    const existing = await this.kubernetesService.getResource(
      kubeconfig,
      'Deployment',
      ReflectorInstallerService.DEPLOYMENT_NAME,
      ReflectorInstallerService.DEPLOYMENT_NAMESPACE,
    );
    if (existing) {
      return;
    }

    this.logger.log(
      `Installing kubernetes-reflector ${ReflectorInstallerService.VERSION}`,
    );
    const manifest = await this.fetchManifest();
    await this.kubernetesService.applyManifest(kubeconfig, manifest);
    await this.waitDeploymentReady(kubeconfig);
    this.logger.log(`kubernetes-reflector ready`);
  }

  private async fetchManifest(): Promise<string> {
    if (this.manifestCache) {
      return this.manifestCache;
    }
    const response = await fetch(ReflectorInstallerService.MANIFEST_URL);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch reflector manifest from ${ReflectorInstallerService.MANIFEST_URL}: ${response.status} ${response.statusText}`,
      );
    }
    this.manifestCache = await response.text();
    return this.manifestCache;
  }

  private async waitDeploymentReady(kubeconfig: string): Promise<void> {
    const startTime = Date.now();
    while (
      Date.now() - startTime <
      ReflectorInstallerService.READY_TIMEOUT_MS
    ) {
      const resource = await this.kubernetesService.getResource(
        kubeconfig,
        'Deployment',
        ReflectorInstallerService.DEPLOYMENT_NAME,
        ReflectorInstallerService.DEPLOYMENT_NAMESPACE,
      );
      const body = resource?.body ?? resource;
      const desired = body?.spec?.replicas ?? 1;
      const available = body?.status?.availableReplicas ?? 0;
      if (available >= desired) {
        return;
      }
      await new Promise((r) =>
        setTimeout(r, ReflectorInstallerService.POLL_INTERVAL_MS),
      );
    }
    throw new Error(
      `kubernetes-reflector Deployment not ready after ${ReflectorInstallerService.READY_TIMEOUT_MS}ms`,
    );
  }
}
