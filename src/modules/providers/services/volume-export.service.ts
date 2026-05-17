import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import * as k8s from '@kubernetes/client-node';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import {
  CreateExportInput,
  DeleteExportInput,
  ExportResult,
  ExportSinkKind,
  ExportSummary,
  IVolumeExport,
  ListExportsInput,
  PvcCloneExportInput,
  RestorePvcFromExportInput,
  S3ArchiveExportInput,
  VolumeExportCapabilities,
} from '../interfaces/volume-export.interface';

const TAR_IMAGE = 'busybox:1.37';
const RCLONE_IMAGE = 'rclone/rclone:1.67';
const PVC_CLONE_LABEL = 'flui.cloud/pvc-clone-export';
const SOURCE_PVC_LABEL = 'flui.cloud/exported-from';
const SINK_LABEL = 'flui.cloud/export-sink';
const COPY_JOB_TIMEOUT_SECONDS = 30 * 60;

/**
 * Universal volume export primitive based on the copy-pod pattern.
 *
 * One implementation serves every Flui-supported provider: the storage class
 * is always `local-path` (rancher.io/local-path) on top of NFS+fscache,
 * therefore "snapshot" / "backup" cannot rely on CSI VolumeSnapshot. Both
 * sink kinds — pvc-clone and s3-archive — funnel through a Job that mounts
 * the source PVC and streams data to the chosen sink.
 *
 * Provider-specific behavior (cost, capabilities) is exposed through
 * `capabilities` so the upper layers can warn / price accordingly.
 */
@Injectable()
export class VolumeExportService implements IVolumeExport {
  private readonly logger = new Logger(VolumeExportService.name);

  readonly capabilities: VolumeExportCapabilities = {
    pvcCloneSupportsCheapRetention: false,
    s3ArchiveSupportsCheapRetention: true,
    pvcClonePricePerGbMonthEur: null,
    s3ArchivePricePerGbMonthEur: null,
  };

  constructor(private readonly k8s: KubernetesService) {}

  async createExport(input: CreateExportInput): Promise<ExportResult> {
    if (input.sink === 'pvc-clone') {
      return this.createPvcCloneExport(input);
    }
    return this.createS3ArchiveExport(input);
  }

  async listExports(input: ListExportsInput): Promise<ExportSummary[]> {
    const namespace = input.namespace ?? '';
    if (!namespace) {
      this.logger.debug(
        '[volume-export] list across all namespaces not supported here; pass namespace',
      );
      return [];
    }

    const labelParts: string[] = [];
    if (input.sink) labelParts.push(`${SINK_LABEL}=${input.sink}`);
    else labelParts.push(`${PVC_CLONE_LABEL}=true`);
    if (input.labelSelector) labelParts.push(input.labelSelector);
    const labelSelector = labelParts.join(',');

    const items = await this.k8s.listResourcesByLabel(
      input.kubeconfig,
      'PersistentVolumeClaim',
      namespace,
      labelSelector,
    );

    return items.map((pvc: any) => {
      const labels = (pvc?.metadata?.labels as Record<string, string>) ?? {};
      const annotations =
        (pvc?.metadata?.annotations as Record<string, string>) ?? {};
      const sizeGb = this.parseStorageGb(
        pvc?.spec?.resources?.requests?.storage ?? '0',
      );
      const actualBytesRaw = annotations['flui.cloud/actual-bytes'];
      const actualBytes = actualBytesRaw
        ? Number.parseInt(actualBytesRaw, 10)
        : undefined;
      return {
        exportId: pvc?.metadata?.name as string,
        sink: 'pvc-clone' as ExportSinkKind,
        namespace: pvc?.metadata?.namespace as string,
        sourcePvcName: labels[SOURCE_PVC_LABEL],
        appId: labels['flui-app-id'],
        sizeGb,
        actualBytes: Number.isFinite(actualBytes) ? actualBytes : undefined,
        createdAt:
          (pvc?.metadata?.creationTimestamp as string) ??
          new Date().toISOString(),
        ready: pvc?.status?.phase === 'Bound',
        labels,
      };
    });
  }

  async deleteExport(input: DeleteExportInput): Promise<void> {
    if (input.sink === 'pvc-clone') {
      try {
        await this.k8s.deleteResource(
          input.kubeconfig,
          'PersistentVolumeClaim',
          input.exportId,
          input.namespace,
        );
      } catch (err: any) {
        if (input.ignoreNotFound && err?.message?.includes('not found')) return;
        throw err;
      }
      return;
    }

    if (!input.s3) {
      throw new Error(
        'deleteExport(sink=s3-archive) requires s3 credentials in input.s3',
      );
    }

    const jobName = this.s3DeleteJobName(input.exportId);
    const jobManifest = this.renderS3DeleteJobManifest({
      jobName,
      namespace: input.namespace,
      keyPrefix: input.exportId,
      s3: input.s3,
      labels: {
        'flui.cloud/managed-by': 'flui-cloud',
        [SINK_LABEL]: 's3-archive',
      },
    });
    await this.k8s.applyManifest(input.kubeconfig, jobManifest);
    await this.waitForJobCompletion(
      input.kubeconfig,
      input.namespace,
      jobName,
      COPY_JOB_TIMEOUT_SECONDS,
    );
    await this.cleanupCopyJob(input.kubeconfig, input.namespace, jobName);
  }

  async restoreFromExport(
    input: RestorePvcFromExportInput,
  ): Promise<{ pvcName: string }> {
    const newPvcLabels: Record<string, string> = {
      ...input.labels,
      'flui.cloud/restored-from': input.exportId,
    };
    const pvcManifest = this.renderPvcManifest({
      name: input.newPvcName,
      namespace: input.namespace,
      storageClassName: input.storageClassName,
      storage: `${input.sizeGb}Gi`,
      labels: newPvcLabels,
    });
    await this.k8s.applyManifest(input.kubeconfig, pvcManifest);

    const jobName = `${input.newPvcName}-restore`;
    const jobManifest =
      input.sink === 'pvc-clone'
        ? this.renderTarCopyJobManifest({
            jobName,
            namespace: input.namespace,
            sourcePvcName: input.exportId,
            destPvcName: input.newPvcName,
            nodeSelectorHostname: input.preferredNode,
            labels: newPvcLabels,
          })
        : this.renderS3RestoreJobManifest({
            jobName,
            namespace: input.namespace,
            destPvcName: input.newPvcName,
            keyPrefix: input.exportId,
            s3: this.requireS3(input.s3),
            nodeSelectorHostname: input.preferredNode,
            labels: newPvcLabels,
          });
    await this.k8s.applyManifest(input.kubeconfig, jobManifest);
    await this.waitForJobCompletion(
      input.kubeconfig,
      input.namespace,
      jobName,
      COPY_JOB_TIMEOUT_SECONDS,
    );
    await this.cleanupCopyJob(input.kubeconfig, input.namespace, jobName);
    return { pvcName: input.newPvcName };
  }

  // ─── pvc-clone sink ────────────────────────────────────────────────────────

  private async createPvcCloneExport(
    input: PvcCloneExportInput,
  ): Promise<ExportResult> {
    const sourcePvc = await this.requireSourcePvc(
      input.kubeconfig,
      input.namespace,
      input.sourcePvcName,
    );
    const sourceUid = sourcePvc?.metadata?.uid as string | undefined;
    const storageRequest =
      sourcePvc?.spec?.resources?.requests?.storage ?? '10Gi';
    const sizeGb = this.parseStorageGb(storageRequest);
    const storageClass =
      input.destStorageClass ?? (sourcePvc?.spec?.storageClassName as string);
    const sourceNode = sourcePvc?.metadata?.annotations?.[
      'volume.kubernetes.io/selected-node'
    ] as string | undefined;

    const exportLabels: Record<string, string> = {
      ...input.labels,
      [PVC_CLONE_LABEL]: 'true',
      [SINK_LABEL]: 'pvc-clone',
      [SOURCE_PVC_LABEL]: input.sourcePvcName,
      ...(sourceUid ? { 'flui.cloud/source-pvc-uid': sourceUid } : {}),
    };

    const pvcManifest = this.renderPvcManifest({
      name: input.exportName,
      namespace: input.namespace,
      storageClassName: storageClass,
      storage: storageRequest,
      labels: exportLabels,
    });
    await this.k8s.applyManifest(input.kubeconfig, pvcManifest);

    // K8s auto-injects `batch.kubernetes.io/job-name=<jobName>` as a label
    // on the pod template, and label values must be ≤63 chars. The natural
    // `${exportName}-copy` form overflows for long descriptive exportIds
    // (e.g. `<app>-<rand>-snap-<ts>-<description>-copy` easily hits 64+).
    // Hash-suffix the name once we cross the line so the operation never
    // fails just because the user picked a descriptive snapshot name.
    const naturalName = `${input.exportName}-copy`;
    const jobName =
      naturalName.length <= 63
        ? naturalName
        : `copy-${this.shortId(input.exportName)}`;
    const jobManifest = this.renderTarCopyJobManifest({
      jobName,
      namespace: input.namespace,
      sourcePvcName: input.sourcePvcName,
      destPvcName: input.exportName,
      nodeSelectorHostname: sourceNode,
      labels: exportLabels,
    });
    await this.k8s.applyManifest(input.kubeconfig, jobManifest);
    await this.waitForJobCompletion(
      input.kubeconfig,
      input.namespace,
      jobName,
      COPY_JOB_TIMEOUT_SECONDS,
    );
    const actualBytes = await this.parseActualBytesFromJob(
      input.kubeconfig,
      input.namespace,
      jobName,
      /FLUI_ACTUAL_BYTES=(\d+)/,
    );
    if (actualBytes !== undefined) {
      await this.annotateExportPvc(
        input.kubeconfig,
        input.namespace,
        input.exportName,
        actualBytes,
      );
    }
    await this.cleanupCopyJob(input.kubeconfig, input.namespace, jobName);

    return {
      exportId: input.exportName,
      sink: 'pvc-clone',
      namespace: input.namespace,
      sourceSizeGb: sizeGb,
      actualBytes,
      createdAt: new Date().toISOString(),
      ready: true,
    };
  }

  // ─── s3-archive sink ──────────────────────────────────────────────────────

  private async createS3ArchiveExport(
    input: S3ArchiveExportInput,
  ): Promise<ExportResult> {
    const sourcePvc = await this.requireSourcePvc(
      input.kubeconfig,
      input.namespace,
      input.sourcePvcName,
    );
    const storageRequest =
      sourcePvc?.spec?.resources?.requests?.storage ?? '10Gi';
    const sizeGb = this.parseStorageGb(storageRequest);
    const sourceNode = sourcePvc?.metadata?.annotations?.[
      'volume.kubernetes.io/selected-node'
    ] as string | undefined;

    const exportLabels: Record<string, string> = {
      ...input.labels,
      [SINK_LABEL]: 's3-archive',
      [SOURCE_PVC_LABEL]: input.sourcePvcName,
    };

    const jobName = `s3up-${this.shortId(input.exportName)}`;
    const jobManifest = this.renderS3ExportJobManifest({
      jobName,
      namespace: input.namespace,
      sourcePvcName: input.sourcePvcName,
      keyPrefix: input.keyPrefix,
      s3: {
        bucket: input.bucket,
        endpoint: input.endpoint,
        region: input.region,
        accessKeyId: input.accessKeyId,
        secretAccessKey: input.secretAccessKey,
      },
      nodeSelectorHostname: sourceNode,
      labels: exportLabels,
    });
    await this.k8s.applyManifest(input.kubeconfig, jobManifest);
    await this.waitForJobCompletion(
      input.kubeconfig,
      input.namespace,
      jobName,
      COPY_JOB_TIMEOUT_SECONDS,
    );
    const actualBytes = await this.parseActualBytesFromJob(
      input.kubeconfig,
      input.namespace,
      jobName,
      /FLUI_ACTUAL_BYTES=(\d+)/,
    );
    await this.cleanupCopyJob(input.kubeconfig, input.namespace, jobName);

    return {
      exportId: input.keyPrefix,
      sink: 's3-archive',
      namespace: input.namespace,
      sourceSizeGb: sizeGb,
      actualBytes,
      createdAt: new Date().toISOString(),
      ready: true,
    };
  }

  // ─── shared helpers ────────────────────────────────────────────────────────

  private async requireSourcePvc(
    kubeconfig: string,
    namespace: string,
    name: string,
  ): Promise<any> {
    const sourcePvc = await this.k8s.getResource(
      kubeconfig,
      'PersistentVolumeClaim',
      name,
      namespace,
    );
    if (!sourcePvc) {
      throw new Error(
        `Source PVC ${namespace}/${name} not found, cannot export`,
      );
    }
    return sourcePvc;
  }

  private requireS3(
    s3: DeleteExportInput['s3'],
  ): NonNullable<DeleteExportInput['s3']> {
    if (!s3) throw new Error('s3 credentials required for s3-archive sink');
    return s3;
  }

  private s3DeleteJobName(exportId: string): string {
    return `s3del-${this.shortId(exportId)}`;
  }

  private shortId(value: string): string {
    return createHash('sha256').update(value).digest('hex').slice(0, 16);
  }

  /**
   * Read the completed copy-pod logs and extract the actual byte count
   * emitted by the container as `FLUI_ACTUAL_BYTES=<n>` on its last line.
   * Returns undefined when the marker is missing or unparseable.
   */
  private async parseActualBytesFromJob(
    kubeconfig: string,
    namespace: string,
    jobName: string,
    marker: RegExp,
  ): Promise<number | undefined> {
    try {
      const pods = await this.k8s.listResourcesByLabel(
        kubeconfig,
        'Pod',
        namespace,
        `job-name=${jobName}`,
      );
      const pod = pods.find(
        (p: any) => (p?.status?.phase as string | undefined) === 'Succeeded',
      );
      const podName = pod?.metadata?.name as string | undefined;
      if (!podName) return undefined;
      const logs = await this.k8s.getPodLogs(
        kubeconfig,
        podName,
        namespace,
        undefined,
        50,
      );
      const match = marker.exec(logs);
      if (!match) return undefined;
      const parsed = Number.parseInt(match[1], 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    } catch (err: any) {
      this.logger.warn(
        `[volume-export] could not parse actual bytes from ${namespace}/${jobName}: ${err.message}`,
      );
      return undefined;
    }
  }

  private async annotateExportPvc(
    kubeconfig: string,
    namespace: string,
    pvcName: string,
    actualBytes: number,
  ): Promise<void> {
    try {
      const kc = this.k8s.makeKubeConfig(kubeconfig);
      const client = k8s.KubernetesObjectApi.makeApiClient(kc);
      const patch = {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: {
          name: pvcName,
          namespace,
          annotations: {
            'flui.cloud/actual-bytes': String(actualBytes),
          },
        },
      };
      await client.patch(
        patch,
        undefined,
        undefined,
        'flui-api',
        undefined,
        k8s.PatchStrategy.StrategicMergePatch,
      );
    } catch (err: any) {
      this.logger.warn(
        `[volume-export] could not annotate PVC ${namespace}/${pvcName} with actual bytes: ${err.message}`,
      );
    }
  }

  private async cleanupCopyJob(
    kubeconfig: string,
    namespace: string,
    jobName: string,
  ): Promise<void> {
    try {
      const pods = await this.k8s.listResourcesByLabel(
        kubeconfig,
        'Pod',
        namespace,
        `job-name=${jobName}`,
      );
      for (const pod of pods) {
        const podName = pod?.metadata?.name as string | undefined;
        if (!podName) continue;
        await this.k8s
          .deleteResource(kubeconfig, 'Pod', podName, namespace)
          .catch((err: any) =>
            this.logger.warn(
              `[volume-export] Pod cleanup failed for ${namespace}/${podName}: ${err.message}`,
            ),
          );
      }
    } catch (err: any) {
      this.logger.warn(
        `[volume-export] Pod listing for cleanup failed in ${namespace}/${jobName}: ${err.message}`,
      );
    }
    await this.k8s
      .deleteResource(kubeconfig, 'Job', jobName, namespace)
      .catch((err: any) =>
        this.logger.warn(
          `[volume-export] Job cleanup failed for ${namespace}/${jobName}: ${err.message}`,
        ),
      );
  }

  private async waitForJobCompletion(
    kubeconfig: string,
    namespace: string,
    jobName: string,
    timeoutSeconds: number,
  ): Promise<void> {
    const pollIntervalMs = 5000;
    const start = Date.now();
    while (Date.now() - start < timeoutSeconds * 1000) {
      const job = await this.k8s.getResource(
        kubeconfig,
        'Job',
        jobName,
        namespace,
      );
      const succeeded = job?.status?.succeeded ?? 0;
      const failed = job?.status?.failed ?? 0;
      if (succeeded > 0) return;
      if (failed > 0) {
        throw new Error(
          `Copy-pod Job ${namespace}/${jobName} failed (failed=${failed})`,
        );
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    throw new Error(
      `Copy-pod Job ${namespace}/${jobName} timed out after ${timeoutSeconds}s`,
    );
  }

  // ─── manifest renderers ────────────────────────────────────────────────────

  private renderPvcManifest(args: {
    name: string;
    namespace: string;
    storageClassName: string;
    storage: string;
    labels: Record<string, string>;
  }): string {
    const labelLines = this.renderLabelLines(args.labels, '    ');
    return [
      'apiVersion: v1',
      'kind: PersistentVolumeClaim',
      'metadata:',
      `  name: ${args.name}`,
      `  namespace: ${args.namespace}`,
      '  labels:',
      labelLines,
      'spec:',
      '  accessModes:',
      '    - ReadWriteOnce',
      `  storageClassName: ${args.storageClassName}`,
      '  resources:',
      '    requests:',
      `      storage: ${args.storage}`,
      '',
    ].join('\n');
  }

  private renderTarCopyJobManifest(args: {
    jobName: string;
    namespace: string;
    sourcePvcName: string;
    destPvcName: string;
    nodeSelectorHostname?: string;
    labels: Record<string, string>;
  }): string {
    const labelLinesMeta = this.renderLabelLines(args.labels, '    ');
    const labelLinesPod = this.renderLabelLines(args.labels, '        ');
    const nodeSelectorBlock = args.nodeSelectorHostname
      ? [
          '      nodeSelector:',
          `        kubernetes.io/hostname: ${args.nodeSelectorHostname}`,
        ].join('\n')
      : '';
    return [
      'apiVersion: batch/v1',
      'kind: Job',
      'metadata:',
      `  name: ${args.jobName}`,
      `  namespace: ${args.namespace}`,
      '  labels:',
      labelLinesMeta,
      'spec:',
      '  backoffLimit: 1',
      `  activeDeadlineSeconds: ${COPY_JOB_TIMEOUT_SECONDS}`,
      '  ttlSecondsAfterFinished: 600',
      '  template:',
      '    metadata:',
      '      labels:',
      labelLinesPod,
      '    spec:',
      '      restartPolicy: Never',
      ...(nodeSelectorBlock ? [nodeSelectorBlock] : []),
      '      containers:',
      '        - name: copy',
      `          image: ${TAR_IMAGE}`,
      '          command:',
      '            - /bin/sh',
      '            - -c',
      String.raw`            - 'set -e; cd /src && tar -cf - . | tar -C /dst -xf - && sync && echo FLUI_ACTUAL_BYTES=$(du -sb /dst | awk "{print \$1}")'`,
      '          volumeMounts:',
      '            - name: src',
      '              mountPath: /src',
      '              readOnly: true',
      '            - name: dst',
      '              mountPath: /dst',
      '      volumes:',
      '        - name: src',
      '          persistentVolumeClaim:',
      `            claimName: ${args.sourcePvcName}`,
      '            readOnly: true',
      '        - name: dst',
      '          persistentVolumeClaim:',
      `            claimName: ${args.destPvcName}`,
      '',
    ].join('\n');
  }

  private renderS3ExportJobManifest(args: {
    jobName: string;
    namespace: string;
    sourcePvcName: string;
    keyPrefix: string;
    s3: NonNullable<DeleteExportInput['s3']>;
    nodeSelectorHostname?: string;
    labels: Record<string, string>;
  }): string {
    const labelLinesMeta = this.renderLabelLines(args.labels, '    ');
    const labelLinesPod = this.renderLabelLines(args.labels, '        ');
    const nodeSelectorBlock = args.nodeSelectorHostname
      ? [
          '      nodeSelector:',
          `        kubernetes.io/hostname: ${args.nodeSelectorHostname}`,
        ].join('\n')
      : '';
    const remote = `flui:${args.s3.bucket}/${args.keyPrefix}`;
    return [
      'apiVersion: batch/v1',
      'kind: Job',
      'metadata:',
      `  name: ${args.jobName}`,
      `  namespace: ${args.namespace}`,
      '  labels:',
      labelLinesMeta,
      'spec:',
      '  backoffLimit: 1',
      `  activeDeadlineSeconds: ${COPY_JOB_TIMEOUT_SECONDS}`,
      '  ttlSecondsAfterFinished: 600',
      '  template:',
      '    metadata:',
      '      labels:',
      labelLinesPod,
      '    spec:',
      '      restartPolicy: Never',
      ...(nodeSelectorBlock ? [nodeSelectorBlock] : []),
      '      containers:',
      '        - name: rclone',
      `          image: ${RCLONE_IMAGE}`,
      '          command:',
      '            - /bin/sh',
      '            - -c',
      String.raw`            - 'rclone -v --retries 2 --s3-no-check-bucket sync /src "${remote}" && echo FLUI_ACTUAL_BYTES=$(du -sb /src | awk "{print \$1}")'`,
      this.renderS3EnvBlock(args.s3),
      '          volumeMounts:',
      '            - name: src',
      '              mountPath: /src',
      '              readOnly: true',
      '      volumes:',
      '        - name: src',
      '          persistentVolumeClaim:',
      `            claimName: ${args.sourcePvcName}`,
      '            readOnly: true',
      '',
    ].join('\n');
  }

  private renderS3RestoreJobManifest(args: {
    jobName: string;
    namespace: string;
    destPvcName: string;
    keyPrefix: string;
    s3: NonNullable<DeleteExportInput['s3']>;
    nodeSelectorHostname?: string;
    labels: Record<string, string>;
  }): string {
    const labelLinesMeta = this.renderLabelLines(args.labels, '    ');
    const labelLinesPod = this.renderLabelLines(args.labels, '        ');
    const nodeSelectorBlock = args.nodeSelectorHostname
      ? [
          '      nodeSelector:',
          `        kubernetes.io/hostname: ${args.nodeSelectorHostname}`,
        ].join('\n')
      : '';
    const remote = `flui:${args.s3.bucket}/${args.keyPrefix}`;
    return [
      'apiVersion: batch/v1',
      'kind: Job',
      'metadata:',
      `  name: ${args.jobName}`,
      `  namespace: ${args.namespace}`,
      '  labels:',
      labelLinesMeta,
      'spec:',
      '  backoffLimit: 1',
      `  activeDeadlineSeconds: ${COPY_JOB_TIMEOUT_SECONDS}`,
      '  ttlSecondsAfterFinished: 600',
      '  template:',
      '    metadata:',
      '      labels:',
      labelLinesPod,
      '    spec:',
      '      restartPolicy: Never',
      ...(nodeSelectorBlock ? [nodeSelectorBlock] : []),
      '      containers:',
      '        - name: rclone',
      `          image: ${RCLONE_IMAGE}`,
      '          command:',
      '            - /bin/sh',
      '            - -c',
      `            - 'rclone sync "${remote}" /dst'`,
      this.renderS3EnvBlock(args.s3),
      '          volumeMounts:',
      '            - name: dst',
      '              mountPath: /dst',
      '      volumes:',
      '        - name: dst',
      '          persistentVolumeClaim:',
      `            claimName: ${args.destPvcName}`,
      '',
    ].join('\n');
  }

  private renderS3DeleteJobManifest(args: {
    jobName: string;
    namespace: string;
    keyPrefix: string;
    s3: NonNullable<DeleteExportInput['s3']>;
    labels: Record<string, string>;
  }): string {
    const labelLinesMeta = this.renderLabelLines(args.labels, '    ');
    const labelLinesPod = this.renderLabelLines(args.labels, '        ');
    const remote = `flui:${args.s3.bucket}/${args.keyPrefix}`;
    return [
      'apiVersion: batch/v1',
      'kind: Job',
      'metadata:',
      `  name: ${args.jobName}`,
      `  namespace: ${args.namespace}`,
      '  labels:',
      labelLinesMeta,
      'spec:',
      '  backoffLimit: 1',
      `  activeDeadlineSeconds: ${COPY_JOB_TIMEOUT_SECONDS}`,
      '  ttlSecondsAfterFinished: 600',
      '  template:',
      '    metadata:',
      '      labels:',
      labelLinesPod,
      '    spec:',
      '      restartPolicy: Never',
      '      containers:',
      '        - name: rclone',
      `          image: ${RCLONE_IMAGE}`,
      '          command:',
      '            - /bin/sh',
      '            - -c',
      `            - 'rclone purge "${remote}" || rclone delete "${remote}"'`,
      this.renderS3EnvBlock(args.s3),
      '',
    ].join('\n');
  }

  private renderS3EnvBlock(s3: NonNullable<DeleteExportInput['s3']>): string {
    return [
      '          env:',
      '            - name: RCLONE_CONFIG_FLUI_TYPE',
      '              value: "s3"',
      '            - name: RCLONE_CONFIG_FLUI_PROVIDER',
      '              value: "Other"',
      '            - name: RCLONE_CONFIG_FLUI_ACCESS_KEY_ID',
      `              value: ${this.yamlString(s3.accessKeyId)}`,
      '            - name: RCLONE_CONFIG_FLUI_SECRET_ACCESS_KEY',
      `              value: ${this.yamlString(s3.secretAccessKey)}`,
      '            - name: RCLONE_CONFIG_FLUI_ENDPOINT',
      `              value: ${this.yamlString(s3.endpoint)}`,
      '            - name: RCLONE_CONFIG_FLUI_REGION',
      `              value: ${this.yamlString(s3.region || 'auto')}`,
    ].join('\n');
  }

  private renderLabelLines(
    labels: Record<string, string>,
    indent: string,
  ): string {
    return Object.entries(labels)
      .map(([k, v]) => `${indent}${this.yamlString(k)}: ${this.yamlString(v)}`)
      .join('\n');
  }

  private parseStorageGb(value: string): number {
    if (!value) return 0;
    const match = /^(\d+(?:\.\d+)?)([KMGTP]i?)?$/.exec(String(value));
    if (!match) return 0;
    const num = Number.parseFloat(match[1]);
    const unit = match[2];
    switch (unit) {
      case 'Ki':
        return num / (1024 * 1024);
      case 'Mi':
        return num / 1024;
      case 'Gi':
        return num;
      case 'Ti':
        return num * 1024;
      case 'K':
        return num / 1_000_000;
      case 'M':
        return num / 1000;
      case 'G':
        return num;
      case 'T':
        return num * 1000;
      default:
        return num;
    }
  }

  private yamlString(value: string): string {
    return JSON.stringify(value);
  }
}
