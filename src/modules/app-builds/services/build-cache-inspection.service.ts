import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import {
  BuildCacheSnapshotEntity,
  PackageCacheEntry,
} from '../entities/build-cache-snapshot.entity';
import {
  BuildJobService,
  BUILD_NAMESPACE,
  BUILD_CACHE_PVC_NAME,
} from './build-job.service';
import { BuildAgentConfigService } from './build-agent-config.service';
import {
  BuildCacheBreakdownResponseDto,
  PackageCacheEntryDto,
} from '../dto/build-cache-breakdown.dto';

const INSPECTION_JOB_PURPOSE = 'cache-inspect';
const STALE_LOCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const INSPECTION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const POLL_INTERVAL_MS = 3_000;

interface ParsedCacheBreakdown {
  totalSizeBytes: number;
  layerSizeBytes: number;
  packageCacheSizeBytes: number;
  packageCaches: PackageCacheEntry[];
}

@Injectable()
export class BuildCacheInspectionService {
  private readonly logger = new Logger(BuildCacheInspectionService.name);

  constructor(
    @InjectRepository(BuildCacheSnapshotEntity)
    private readonly snapshotRepository: Repository<BuildCacheSnapshotEntity>,
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly buildJobService: BuildJobService,
    private readonly kubernetesService: KubernetesService,
    private readonly encryptionService: EncryptionService,
    private readonly buildAgentConfig: BuildAgentConfigService,
  ) {}

  /**
   * Fire-and-forget: trigger a background cache inspection.
   * Safe to call without awaiting — errors are swallowed and logged as warnings.
   * No-op when the in-cluster build agent is disabled.
   */
  triggerBackgroundScan(clusterId: string): void {
    if (!this.buildAgentConfig.isInClusterBuildAgentEnabled()) {
      this.logger.debug(
        `Skipping background cache scan for cluster ${clusterId}: in-cluster build agent is disabled`,
      );
      return;
    }
    this.runInspection(clusterId).catch((err) => {
      this.logger.warn(
        `Background cache scan skipped or failed for cluster ${clusterId}: ${err.message}`,
      );
    });
  }

  /**
   * Return the cached breakdown from DB. Never makes a K8s call.
   * Returns a zero-value DTO if no snapshot exists yet.
   */
  async getCacheBreakdown(
    clusterId: string,
  ): Promise<BuildCacheBreakdownResponseDto> {
    const snapshot = await this.snapshotRepository.findOne({
      where: { clusterId },
    });

    const dto = new BuildCacheBreakdownResponseDto();
    dto.clusterId = clusterId;

    if (!snapshot) {
      dto.scanStatus = 'pending';
      dto.scannedAt = null;
      dto.totalSizeBytes = null;
      dto.totalHumanSize = null;
      dto.layers = { sizeBytes: null, humanSize: null };
      dto.packageCaches = [];
      dto.packageCachesTotalHumanSize = null;
      return dto;
    }

    dto.scanStatus = snapshot.scanInProgress
      ? 'in_progress'
      : snapshot.lastScanStatus;
    dto.scannedAt = snapshot.scannedAt;
    dto.totalSizeBytes = snapshot.totalSizeBytes;
    dto.totalHumanSize =
      snapshot.totalSizeBytes == null
        ? null
        : formatBytes(snapshot.totalSizeBytes);
    dto.layers = {
      sizeBytes: snapshot.layerSizeBytes,
      humanSize:
        snapshot.layerSizeBytes == null
          ? null
          : formatBytes(snapshot.layerSizeBytes),
    };
    dto.packageCaches = (snapshot.packageCaches ?? []).map((e) => {
      const entry = new PackageCacheEntryDto();
      entry.id = e.id;
      entry.mountPath = e.mountPath;
      entry.sizeBytes = e.sizeBytes;
      entry.humanSize = e.humanSize;
      entry.reclaimable = e.reclaimable;
      entry.lastUsed = e.lastUsed;
      return entry;
    });
    dto.packageCachesTotalHumanSize =
      snapshot.packageCacheSizeBytes == null
        ? null
        : formatBytes(snapshot.packageCacheSizeBytes);

    return dto;
  }

  /**
   * Manually trigger an inspection. Returns the skip reason if inspection cannot start.
   */
  async requestRefresh(
    clusterId: string,
  ): Promise<{ status: 'started' | 'skipped'; reason?: string }> {
    if (!this.buildAgentConfig.isInClusterBuildAgentEnabled()) {
      return { status: 'skipped', reason: 'agent_disabled' };
    }

    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster?.kubeconfigEncrypted) {
      return { status: 'skipped', reason: 'cluster_not_found' };
    }

    const snapshot = await this.snapshotRepository.findOne({
      where: { clusterId },
    });
    if (snapshot?.scanInProgress && snapshot.scanStartedAt) {
      const staleCutoff = new Date(Date.now() - STALE_LOCK_THRESHOLD_MS);
      if (snapshot.scanStartedAt > staleCutoff) {
        return { status: 'skipped', reason: 'scan_already_running' };
      }
    }

    // Don't block the HTTP request — run in background
    this.runInspection(clusterId).catch((err) => {
      this.logger.warn(
        `Manual cache scan failed for cluster ${clusterId}: ${err.message}`,
      );
    });

    return { status: 'started' };
  }

  // ─── Core inspection flow ───────────────────────────────────────────────────

  private async runInspection(clusterId: string): Promise<void> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster?.kubeconfigEncrypted) {
      this.logger.debug(
        `Skipping cache scan: cluster ${clusterId} not found or has no kubeconfig`,
      );
      return;
    }

    // Acquire DB lock
    await this.snapshotRepository.upsert(
      {
        clusterId,
        scanInProgress: true,
        scanStartedAt: new Date(),
        lastScanStatus: 'pending',
      },
      ['clusterId'],
    );

    const startedAt = Date.now();
    let inspectionJobName: string | null = null;

    try {
      const kubeconfig = this.encryptionService.decrypt(
        cluster.kubeconfigEncrypted,
      );

      // Check if PVC exists at all
      const pvcInfo =
        await this.buildJobService.getBuildCachePvcInfo(kubeconfig);
      if (!pvcInfo.exists) {
        this.logger.debug(
          `Skipping cache scan for cluster ${clusterId}: no cache PVC`,
        );
        await this.updateSnapshot(clusterId, {
          scanInProgress: false,
          lastScanStatus: 'skipped',
        });
        return;
      }

      // Clean up any stale inspection jobs (Completed/Failed) before proceeding.
      // The ttlSecondsAfterFinished controller may not run on all clusters.
      await this.cleanupStaleInspectionJobs(kubeconfig);

      // Check for active build jobs or existing inspection job
      const skipReason = await this.checkLocks(kubeconfig);
      if (skipReason) {
        this.logger.debug(
          `Skipping cache scan for cluster ${clusterId}: ${skipReason}`,
        );
        await this.updateSnapshot(clusterId, {
          scanInProgress: false,
          lastScanStatus: 'skipped',
        });
        return;
      }

      // Create and run inspection job
      inspectionJobName = this.buildInspectionJobName();
      await this.createInspectionJob(kubeconfig, inspectionJobName);
      this.logger.log(
        `Cache inspection job ${inspectionJobName} started for cluster ${clusterId}`,
      );

      // Wait for completion
      const podName = await this.waitForInspectionJob(
        kubeconfig,
        inspectionJobName,
      );

      // Read logs and parse
      const logs = await this.kubernetesService.getPodLogs(
        kubeconfig,
        podName,
        BUILD_NAMESPACE,
        'cache-inspector',
      );

      this.logger.debug(
        `[cache-inspect] raw logs for cluster ${clusterId} (${logs.length} chars):\n${logs.slice(0, 3000)}`,
      );

      const parsed = this.parseBuildctlDu(logs);
      const durationMs = Date.now() - startedAt;

      const cachesSummary = parsed.packageCaches
        .map((e) => `${e.id}:${e.humanSize}`)
        .join(', ');
      this.logger.log(
        `[cache-inspect] parsed: totalSizeBytes=${parsed.totalSizeBytes}, ` +
          `layerSizeBytes=${parsed.layerSizeBytes}, packageCaches=${parsed.packageCaches.length} ` +
          `(${cachesSummary})`,
      );

      await this.updateSnapshot(clusterId, {
        scanInProgress: false,
        lastScanStatus: 'ok',
        scannedAt: new Date(),
        scanDurationMs: durationMs,
        totalSizeBytes: parsed.totalSizeBytes,
        layerSizeBytes: parsed.layerSizeBytes,
        packageCacheSizeBytes: parsed.packageCacheSizeBytes,
        packageCaches: parsed.packageCaches,
      });

      this.logger.log(
        `Cache scan for cluster ${clusterId} completed in ${durationMs}ms. ` +
          `Total: ${formatBytes(parsed.totalSizeBytes)}, ` +
          `Layers: ${formatBytes(parsed.layerSizeBytes)}, ` +
          `Pkg caches: ${parsed.packageCaches.length} entries`,
      );
    } catch (err) {
      this.logger.error(
        `Cache inspection failed for cluster ${clusterId}: ${err.message}`,
        err.stack,
      );
      await this.updateSnapshot(clusterId, {
        scanInProgress: false,
        lastScanStatus: 'failed',
      });
    } finally {
      // Always clean up the inspection job
      if (inspectionJobName) {
        try {
          const kubeconfig = this.encryptionService.decrypt(
            cluster.kubeconfigEncrypted,
          );
          await this.buildJobService.deleteJob(kubeconfig, inspectionJobName);
        } catch (cleanupErr) {
          this.logger.warn(
            `Failed to clean up inspection job ${inspectionJobName}: ${cleanupErr.message}`,
          );
        }
      }
    }
  }

  /** Delete all Completed/Failed inspection jobs and their orphaned pods (TTL controller may not run on all clusters). */
  private async cleanupStaleInspectionJobs(kubeconfig: string): Promise<void> {
    try {
      const { coreApi } = this.kubernetesService.getKubeClient(kubeconfig);
      const { jobs } =
        await this.buildJobService.getNamespaceResources(kubeconfig);
      const stale = jobs.filter(
        (j) =>
          j.purpose === INSPECTION_JOB_PURPOSE &&
          j.status !== 'Running' &&
          j.status !== 'Pending',
      );
      await Promise.all(
        stale.map((j) => this.buildJobService.deleteJob(kubeconfig, j.name)),
      );
      // Explicitly delete orphaned pods — cascade delete is not guaranteed on all clusters
      await coreApi.deleteCollectionNamespacedPod({
        namespace: BUILD_NAMESPACE,
        labelSelector: `flui.cloud/purpose=${INSPECTION_JOB_PURPOSE}`,
      });
      if (stale.length > 0) {
        this.logger.log(
          `Cleaned up ${stale.length} stale inspection job(s): ${stale.map((j) => j.name).join(', ')}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Stale inspection job cleanup failed: ${err.message}`);
    }
  }

  /**
   * Check if any active build jobs or another inspection job is running.
   * Returns a skip reason string if locked, null if clear to proceed.
   */
  private async checkLocks(kubeconfig: string): Promise<string | null> {
    const { jobs } =
      await this.buildJobService.getNamespaceResources(kubeconfig);
    const activeJobs = jobs.filter(
      (j) => j.status === 'Running' || j.status === 'Pending',
    );

    const activeBuild = activeJobs.find(
      (j) => j.purpose === 'build' || j.buildId != null,
    );
    if (activeBuild) return `active build job: ${activeBuild.name}`;

    const activeInspect = activeJobs.find(
      (j) => j.purpose === INSPECTION_JOB_PURPOSE,
    );
    if (activeInspect)
      return `inspection already running: ${activeInspect.name}`;

    return null;
  }

  // ─── K8s job management ─────────────────────────────────────────────────────

  private buildInspectionJobName(): string {
    return `flui-cache-inspect-${Date.now().toString(36)}`.substring(0, 63);
  }

  private async createInspectionJob(
    kubeconfig: string,
    jobName: string,
  ): Promise<void> {
    const usePrivileged = true; // matches build job security context

    const manifest = `
apiVersion: batch/v1
kind: Job
metadata:
  name: ${jobName}
  namespace: ${BUILD_NAMESPACE}
  labels:
    app.kubernetes.io/managed-by: flui-cloud
    flui.cloud/purpose: ${INSPECTION_JOB_PURPOSE}
spec:
  ttlSecondsAfterFinished: 300
  backoffLimit: 0
  activeDeadlineSeconds: 180
  template:
    metadata:
      labels:
        flui.cloud/purpose: ${INSPECTION_JOB_PURPOSE}
    spec:
      restartPolicy: Never
      containers:
        - name: cache-inspector
          image: moby/buildkit:v0.15.1
          command:
            - sh
            - -c
            - |
              buildkitd --addr unix:///run/buildkit/buildkitd.sock &
              BKPID=$!
              ATTEMPTS=0
              until buildctl --addr unix:///run/buildkit/buildkitd.sock debug workers 2>/dev/null; do
                ATTEMPTS=$((ATTEMPTS+1))
                if [ "$ATTEMPTS" -ge 30 ]; then
                  echo "ERROR: buildkitd did not become ready" >&2
                  kill $BKPID 2>/dev/null
                  exit 1
                fi
                sleep 1
              done
              echo "--- CACHE_DU_START ---"
              buildctl --addr unix:///run/buildkit/buildkitd.sock du --verbose
              echo "--- CACHE_DU_END ---"
              kill $BKPID 2>/dev/null
              wait $BKPID 2>/dev/null || true
          securityContext:
            privileged: ${usePrivileged}
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          volumeMounts:
            - name: buildkit-cache
              mountPath: /var/lib/buildkit
      volumes:
        - name: buildkit-cache
          persistentVolumeClaim:
            claimName: ${BUILD_CACHE_PVC_NAME}
`;
    await this.kubernetesService.applyManifest(kubeconfig, manifest);
  }

  /**
   * Poll until inspection Job succeeds or times out.
   * Returns the name of the completed pod so we can read its logs.
   */
  private async waitForInspectionJob(
    kubeconfig: string,
    jobName: string,
  ): Promise<string> {
    const { batchApi, coreApi } =
      this.kubernetesService.getKubeClient(kubeconfig);
    const deadline = Date.now() + INSPECTION_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const job = await batchApi.readNamespacedJob({
        name: jobName,
        namespace: BUILD_NAMESPACE,
      });

      if (job.status?.succeeded > 0) {
        // Find the completed pod to read its logs
        const podsRes = await coreApi.listNamespacedPod({
          namespace: BUILD_NAMESPACE,
          labelSelector: `flui.cloud/purpose=${INSPECTION_JOB_PURPOSE}`,
        });
        const pod = (podsRes.items ?? []).find(
          (p) => p.metadata?.labels?.['job-name'] === jobName,
        );
        if (!pod?.metadata?.name) {
          throw new Error(
            `Inspection job ${jobName} succeeded but pod not found`,
          );
        }
        return pod.metadata.name;
      }

      if (job.status?.failed > 0) {
        throw new Error(`Inspection job ${jobName} failed`);
      }

      await sleep(POLL_INTERVAL_MS);
    }

    throw new Error(
      `Inspection job ${jobName} timed out after ${INSPECTION_TIMEOUT_MS}ms`,
    );
  }

  // ─── Parsing ─────────────────────────────────────────────────────────────────

  /**
   * Parse the output of `buildctl du --verbose` captured between sentinel markers.
   * Extracts per-framework cache entries and layer sizes.
   */
  private parseBuildctlDu(logs: string): ParsedCacheBreakdown {
    const startMarker = '--- CACHE_DU_START ---';
    const endMarker = '--- CACHE_DU_END ---';
    const startIdx = logs.indexOf(startMarker);
    const endIdx = logs.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      this.logger.warn(
        'buildctl du output markers not found — returning empty breakdown',
      );
      return {
        totalSizeBytes: 0,
        layerSizeBytes: 0,
        packageCacheSizeBytes: 0,
        packageCaches: [],
      };
    }

    const raw = logs.slice(startIdx + startMarker.length, endIdx).trim();
    const lines = raw.split('\n');

    // Group lines into blocks — each block starts with a sha256: line
    const blocks: string[][] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (/^sha256:[0-9a-f]{64}/.exec(line)) {
        if (current.length > 0) blocks.push(current);
        current = [line];
      } else if (current.length > 0) {
        current.push(line);
      }
    }
    if (current.length > 0) blocks.push(current);

    const packageCaches: PackageCacheEntry[] = [];
    let totalSizeBytes = 0;
    let layerSizeBytes = 0;
    let packageCacheSizeBytes = 0;

    for (const block of blocks) {
      const firstLine = block[0];
      // Format: sha256:<hex>  true|false  <size> <unit>  <last accessed...>
      const lineMatch =
        /^sha256:[0-9a-f]+\s+(true|false)\s+([\d.]+)\s+(B|kB|MB|GB|KiB|MiB|GiB|TiB)\s+(.+)$/.exec(
          firstLine,
        );
      if (!lineMatch) continue;

      const [, reclaimableStr, sizeNum, sizeUnit, lastUsedRaw] = lineMatch;
      const sizeBytes = parseHumanSize(Number.parseFloat(sizeNum), sizeUnit);
      const reclaimable = reclaimableStr === 'true';
      const lastUsed = lastUsedRaw.trim() === '-' ? null : lastUsedRaw.trim();

      totalSizeBytes += sizeBytes;

      const blockText = block.join('\n');
      const typeMatch = /type:\s*(\S+)/.exec(blockText);
      const idMatch = /\bid:\s*(\S+)/.exec(blockText);
      // Verbose mode may show the mount path in description
      const mountMatch = /mount\s+(\/\S+)/.exec(blockText);

      if (typeMatch?.[1] === 'exec.cachemount' && idMatch?.[1]) {
        const entry: PackageCacheEntry = {
          id: idMatch[1],
          mountPath: mountMatch?.[1] ?? '',
          sizeBytes,
          humanSize: formatBytes(sizeBytes),
          reclaimable,
          lastUsed,
        };
        // Merge with existing entry for the same id (buildkit may store multiple blobs per cache)
        const existing = packageCaches.find((e) => e.id === entry.id);
        if (existing) {
          existing.sizeBytes += sizeBytes;
          existing.humanSize = formatBytes(existing.sizeBytes);
        } else {
          packageCaches.push(entry);
        }
        packageCacheSizeBytes += sizeBytes;
      } else {
        layerSizeBytes += sizeBytes;
      }
    }

    return {
      totalSizeBytes,
      layerSizeBytes,
      packageCacheSizeBytes,
      packageCaches,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async updateSnapshot(
    clusterId: string,
    patch: Partial<BuildCacheSnapshotEntity>,
  ): Promise<void> {
    await this.snapshotRepository.upsert({ clusterId, ...patch }, [
      'clusterId',
    ]);
  }
}

// ─── Pure utility functions ───────────────────────────────────────────────────

function parseHumanSize(value: number, unit: string): number {
  const unitMap: Record<string, number> = {
    B: 1,
    kB: 1_000,
    MB: 1_000_000,
    GB: 1_000_000_000,
    KiB: 1_024,
    MiB: 1_048_576,
    GiB: 1_073_741_824,
    TiB: 1_099_511_627_776,
  };
  return Math.round(value * (unitMap[unit] ?? 1));
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
