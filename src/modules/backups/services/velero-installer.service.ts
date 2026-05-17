import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { BackupDestinationEntity } from '../entities/backup-destination.entity';
import { BackupDestinationRepository } from '../repositories/backup-destination.repository';
import { TemplateRendererService } from './template-renderer.service';
import { StorageBackendFactory } from '../../storage/factories/storage-backend.factory';
import {
  VELERO_NAMESPACE,
  VELERO_DEPLOYMENT_NAME,
  VELERO_NODE_AGENT_DAEMONSET,
  VELERO_IMAGE,
  VELERO_AWS_PLUGIN_IMAGE,
  VELERO_CREDENTIALS_SECRET_NAME,
} from '../backups.constants';

export interface VeleroInstallContext {
  kubeconfig: string;
  destinations: BackupDestinationEntity[];
  primaryDestinationId: string;
}

@Injectable()
export class VeleroInstallerService {
  private readonly logger = new Logger(VeleroInstallerService.name);

  constructor(
    private readonly k8s: KubernetesService,
    private readonly encryption: EncryptionService,
    private readonly destRepo: BackupDestinationRepository,
    private readonly templates: TemplateRendererService,
    private readonly storageFactory: StorageBackendFactory,
  ) {}

  bslName(destinationId: string): string {
    return `flui-dest-${destinationId.slice(0, 8)}`;
  }

  async ensureInstalled(ctx: VeleroInstallContext): Promise<void> {
    const { kubeconfig, destinations, primaryDestinationId } = ctx;
    if (destinations.length === 0) {
      throw new Error('At least one destination required to install Velero');
    }

    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-namespace.yaml.tpl', {
        NAMESPACE: VELERO_NAMESPACE,
      }),
    );
    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-crds.yaml', {}),
    );
    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-rbac.yaml.tpl', {
        NAMESPACE: VELERO_NAMESPACE,
      }),
    );

    // Use the primary destination for the credentials secret used by Velero deployment.
    const primary = destinations.find((d) => d.id === primaryDestinationId);
    if (!primary) {
      throw new Error('Primary destination not found in install context');
    }

    const accessKey = this.encryption.decrypt(primary.accessKeyEncrypted);
    const secretKey = this.encryption.decrypt(primary.secretKeyEncrypted);
    const passphrase = primary.encryptionPassphraseEncrypted
      ? this.encryption.decrypt(primary.encryptionPassphraseEncrypted)
      : crypto.randomBytes(32).toString('hex');

    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-credentials-secret.yaml.tpl', {
        NAMESPACE: VELERO_NAMESPACE,
        SECRET_NAME: VELERO_CREDENTIALS_SECRET_NAME,
        ACCESS_KEY: accessKey,
        SECRET_KEY: secretKey,
        KOPIA_PASSPHRASE: passphrase,
      }),
    );

    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-deployment.yaml.tpl', {
        NAMESPACE: VELERO_NAMESPACE,
        SECRET_NAME: VELERO_CREDENTIALS_SECRET_NAME,
        VELERO_IMAGE,
        AWS_PLUGIN_IMAGE: VELERO_AWS_PLUGIN_IMAGE,
      }),
    );

    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-node-agent.yaml.tpl', {
        NAMESPACE: VELERO_NAMESPACE,
        SECRET_NAME: VELERO_CREDENTIALS_SECRET_NAME,
        VELERO_IMAGE,
      }),
    );

    // Create one BSL per destination
    for (const dest of destinations) {
      await this.applyBSL(kubeconfig, dest, dest.id === primaryDestinationId);
    }

    // Wait for velero deployment readiness
    await this.k8s.waitForReady(
      kubeconfig,
      'Deployment',
      VELERO_DEPLOYMENT_NAME,
      VELERO_NAMESPACE,
      10 * 60 * 1000,
    );
  }

  async applyBSL(
    kubeconfig: string,
    dest: BackupDestinationEntity,
    isDefault: boolean,
  ): Promise<void> {
    const backend = this.storageFactory.forProvider(dest.provider);
    const accessKey = this.encryption.decrypt(dest.accessKeyEncrypted);
    const secretKey = this.encryption.decrypt(dest.secretKeyEncrypted);
    const bsl = backend.toVeleroBSL({
      provider: dest.provider,
      endpoint: dest.endpoint,
      region: dest.region,
      bucket: dest.bucket,
      accessKey,
      secretKey,
      forcePathStyle: dest.forcePathStyle,
      pathPrefix: dest.pathPrefix,
    });

    await this.k8s.applyManifest(
      kubeconfig,
      this.templates.render('velero/velero-bsl.yaml.tpl', {
        BSL_NAME: this.bslName(dest.id),
        NAMESPACE: VELERO_NAMESPACE,
        DESTINATION_ID: dest.id,
        IS_DEFAULT: String(isDefault),
        BUCKET: bsl.bucket,
        PREFIX: bsl.prefix ?? '',
        REGION: dest.region,
        FORCE_PATH_STYLE: bsl.config.s3ForcePathStyle,
        ENDPOINT: dest.endpoint,
        SECRET_NAME: VELERO_CREDENTIALS_SECRET_NAME,
      }),
    );
  }

  async isInstalled(kubeconfig: string): Promise<boolean> {
    const dep = await this.k8s.getResource(
      kubeconfig,
      'Deployment',
      VELERO_DEPLOYMENT_NAME,
      VELERO_NAMESPACE,
    );
    return !!dep;
  }

  daemonsetName(): string {
    return VELERO_NODE_AGENT_DAEMONSET;
  }
}
