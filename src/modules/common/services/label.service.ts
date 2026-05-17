import { Injectable, Logger } from '@nestjs/common';

export interface Label {
  key: string;
  value: string;
}

export type LabelArray = Label[];

export interface GenerateLabelsConfig {
  resourceType: 'server' | 'cluster-node' | 'ssh-key';
  clusterId?: string;
  clusterName?: string;
  nodeId?: string;
  nodeType?: 'master' | 'worker';
  environment?: string;
  sshKeyId?: string;
  sshKeyName?: string;
}

@Injectable()
export class LabelService {
  private readonly logger = new Logger(LabelService.name);
  private readonly FLUI_VERSION = '1.0.0';

  /**
   * Generate standard Flui labels for a server/node
   * @returns Array of label objects
   */
  generateServerLabels(config: GenerateLabelsConfig): LabelArray {
    const labels: LabelArray = [
      { key: 'managed-by', value: 'flui-cloud' },
      // { key: 'flui-version', value: this.FLUI_VERSION }, // Removed - contains dots
      { key: 'flui-resource-type', value: config.resourceType },
      // { key: 'flui-created-at', value: new Date().toISOString() }, // Removed - contains colons and dots
    ];

    if (config.resourceType === 'cluster-node') {
      if (!config.clusterId || !config.clusterName) {
        throw new Error('clusterId and clusterName required for cluster nodes');
      }
      labels.push(
        { key: 'flui-cluster-id', value: config.clusterId },
        { key: 'flui-cluster-name', value: config.clusterName },
      );

      if (config.nodeId) {
        labels.push({ key: 'flui-node-id', value: config.nodeId });
      }

      if (config.nodeType) {
        labels.push({ key: 'flui-node-type', value: config.nodeType });
      }
    }

    if (config.environment) {
      labels.push({ key: 'flui-environment', value: config.environment });
    }

    return labels;
  }

  /**
   * Convert label array to Record for provider compatibility
   */
  toRecord(labels: LabelArray): Record<string, string> {
    return labels.reduce(
      (acc, label) => {
        acc[label.key] = label.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * Convert Record to label array
   */
  fromRecord(record: Record<string, string> | null | undefined): LabelArray {
    if (!record) return [];
    return Object.entries(record).map(([key, value]) => ({ key, value }));
  }

  /**
   * Validate if a server is managed by Flui
   */
  isFluiManagedServer(labels: LabelArray | null | undefined): boolean {
    if (!labels || labels.length === 0) return false;
    return labels.some(
      (l) => l.key === 'managed-by' && l.value === 'flui-cloud',
    );
  }

  /**
   * Get label value by key
   */
  getLabelValue(labels: LabelArray, key: string): string | undefined {
    return labels.find((l) => l.key === key)?.value;
  }

  /**
   * Extract cluster info from labels
   */
  getClusterInfoFromLabels(labels: LabelArray): {
    clusterId?: string;
    clusterName?: string;
    nodeId?: string;
    nodeType?: string;
  } {
    return {
      clusterId: this.getLabelValue(labels, 'flui-cluster-id'),
      clusterName: this.getLabelValue(labels, 'flui-cluster-name'),
      nodeId: this.getLabelValue(labels, 'flui-node-id'),
      nodeType: this.getLabelValue(labels, 'flui-node-type'),
    };
  }

  /**
   * Generate standard Flui labels for an SSH key
   * @returns Array of label objects
   */
  generateSSHKeyLabels(config: {
    sshKeyId: string;
    sshKeyName: string;
    environment?: string;
  }): LabelArray {
    const labels: LabelArray = [
      { key: 'managed-by', value: 'flui-cloud' },
      { key: 'flui-resource-type', value: 'ssh-key' },
      { key: 'flui-ssh-key-id', value: config.sshKeyId },
      { key: 'flui-ssh-key-name', value: config.sshKeyName },
    ];

    if (config.environment) {
      labels.push({ key: 'flui-environment', value: config.environment });
    }

    return labels;
  }

  /**
   * Validate if an SSH key is managed by Flui
   */
  isFluiManagedSSHKey(
    labels: LabelArray | Record<string, string> | null | undefined,
  ): boolean {
    if (!labels) return false;

    const labelArray = Array.isArray(labels) ? labels : this.fromRecord(labels);

    return (
      labelArray.some(
        (l) => l.key === 'managed-by' && l.value === 'flui-cloud',
      ) &&
      labelArray.some(
        (l) => l.key === 'flui-resource-type' && l.value === 'ssh-key',
      )
    );
  }

  /**
   * Extract SSH key info from labels
   */
  getSSHKeyInfoFromLabels(labels: LabelArray | Record<string, string>): {
    sshKeyId?: string;
    sshKeyName?: string;
    environment?: string;
  } {
    const labelArray = Array.isArray(labels) ? labels : this.fromRecord(labels);

    return {
      sshKeyId: this.getLabelValue(labelArray, 'flui-ssh-key-id'),
      sshKeyName: this.getLabelValue(labelArray, 'flui-ssh-key-name'),
      environment: this.getLabelValue(labelArray, 'flui-environment'),
    };
  }
}
