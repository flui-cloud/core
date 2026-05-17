import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { SanCertificateEntity } from '../entities/san-certificate.entity';
import { AppEndpointEntity } from '../entities/app-endpoint.entity';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { ClusterDnsZoneService } from './cluster-dns-zone.service';
import { AcmeCertificateService } from '../../providers/services/acme-certificate.service';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { CertificateStatus } from '../../providers/interfaces/certificate-provider.interface';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import { ReconciliationStatus } from '../../infrastructure/shared/enums/reconciliation-status.enum';
import { CertChallenge } from '../enums/cert-challenge.enum';
import { ReflectorInstallerService } from './reflector-installer.service';
import { CreateSanCertificateDto } from '../dto/create-san-certificate.dto';

export const SAN_CERTIFICATE_QUEUE = 'san-certificate';
export const SAN_CERTIFICATE_RECONCILE_JOB = 'reconcile-san-certificate';

export interface SanCertificateReconcileJobData {
  sanCertificateId: string;
}

export interface EnsureSanResult {
  sanCertificateId: string;
  tlsSecretName: string;
  ready: boolean;
}

@Injectable()
export class SanCertificateService {
  private readonly logger = new Logger(SanCertificateService.name);
  private static readonly MASTER_READY_TIMEOUT_MS = 5 * 60 * 1000;

  constructor(
    @InjectRepository(SanCertificateEntity)
    private readonly repository: Repository<SanCertificateEntity>,
    @InjectRepository(AppEndpointEntity)
    private readonly endpointRepository: Repository<AppEndpointEntity>,
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    @Inject(forwardRef(() => ClusterDnsZoneService))
    private readonly clusterDnsZoneService: ClusterDnsZoneService,
    private readonly acmeCertificateService: AcmeCertificateService,
    private readonly kubernetesService: KubernetesService,
    private readonly encryptionService: EncryptionService,
    private readonly reflectorInstaller: ReflectorInstallerService,
    @InjectQueue(SAN_CERTIFICATE_QUEUE)
    private readonly queue: Queue<SanCertificateReconcileJobData>,
  ) {}

  async create(
    clusterId: string,
    dto: CreateSanCertificateDto,
  ): Promise<SanCertificateEntity> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    const fqdns = dto.fqdns.map((f) => f.trim().toLowerCase());
    const uniqueFqdns = Array.from(new Set(fqdns));
    if (uniqueFqdns.length !== fqdns.length) {
      throw new BadRequestException('fqdns must be unique');
    }

    let zoneId: string | null = null;
    let issuerName: string;
    const provider =
      dto.certificateProvider ?? CertificateProvider.LETS_ENCRYPT;

    if (dto.certChallenge === CertChallenge.DNS_01) {
      if (!dto.clusterDnsZoneId) {
        throw new BadRequestException(
          'clusterDnsZoneId is required when certChallenge=dns-01',
        );
      }
      const assignment = await this.clusterDnsZoneService.getById(
        dto.clusterDnsZoneId,
      );
      if (assignment.clusterId !== clusterId) {
        throw new BadRequestException(
          `clusterDnsZoneId ${dto.clusterDnsZoneId} is not assigned to cluster ${clusterId}`,
        );
      }
      const zoneName = assignment.dnsZone?.zoneName?.toLowerCase();
      if (!zoneName) {
        throw new BadRequestException(
          `Cluster ${clusterId} DNS zone has no zoneName`,
        );
      }
      const outside = uniqueFqdns.filter(
        (f) => f !== zoneName && !f.endsWith(`.${zoneName}`),
      );
      if (outside.length > 0) {
        throw new BadRequestException(
          `All fqdns must fall under zone "${zoneName}" for dns-01. Outside: ${outside.join(', ')}`,
        );
      }
      const issuer =
        await this.clusterDnsZoneService.resolveWildcardIssuer(clusterId);
      if (!issuer) {
        throw new BadRequestException(
          `Cluster ${clusterId} has no ready wildcard ClusterIssuer. Configure the DNS-01 issuer first.`,
        );
      }
      zoneId = assignment.id;
      issuerName = issuer.issuerName;
    } else {
      issuerName = this.acmeCertificateService.getIssuerName(
        this.acmeCertificateService.getAcmeServerUrl(provider),
      );
    }

    const existing = await this.repository.findOne({
      where: { clusterId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `SAN certificate "${dto.name}" already exists on cluster ${clusterId}`,
      );
    }

    const masterCertName = `san-${dto.name}`;
    const masterSecretName = `${masterCertName}-tls`;

    const entity = this.repository.create({
      clusterId,
      clusterDnsZoneId: zoneId,
      name: dto.name,
      dnsNames: uniqueFqdns,
      certChallenge: dto.certChallenge,
      certificateProvider: provider,
      masterNamespace: 'flui-system',
      masterCertName,
      masterSecretName,
      issuerName,
      status: CertificateStatus.PENDING,
      reconciliationStatus: ReconciliationStatus.PENDING,
    });
    const saved = await this.repository.save(entity);

    await this.queue.add(SAN_CERTIFICATE_RECONCILE_JOB, {
      sanCertificateId: saved.id,
    });

    return saved;
  }

  async getById(id: string): Promise<SanCertificateEntity> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`SAN certificate ${id} not found`);
    }
    return entity;
  }

  async listByCluster(clusterId: string): Promise<SanCertificateEntity[]> {
    return await this.repository.find({
      where: { clusterId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    const entity = await this.getById(id);
    const linked = await this.endpointRepository.count({
      where: { sanCertificateId: id },
    });
    if (linked > 0) {
      throw new ConflictException(
        `SAN certificate ${id} is referenced by ${linked} endpoint(s) — delete those first`,
      );
    }

    try {
      const cluster = await this.clusterRepository.findOne({
        where: { id: entity.clusterId },
      });
      if (cluster?.kubeconfigEncrypted) {
        const kubeconfig = await this.getKubeconfig(cluster);
        await this.kubernetesService.deleteResource(
          kubeconfig,
          'Certificate',
          entity.masterCertName,
          entity.masterNamespace,
        );
        await this.kubernetesService.deleteResource(
          kubeconfig,
          'Secret',
          entity.masterSecretName,
          entity.masterNamespace,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Failed to delete master Certificate/Secret for SAN ${id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    await this.repository.delete(id);
  }

  /**
   * Idempotent reconcile: applies master Certificate, waits for Secret, and
   * marks the entity VALID/ISSUING. Invoked by the Bull processor.
   */
  async reconcile(id: string): Promise<void> {
    const entity = await this.getById(id);
    if (entity.reconciliationStatus === ReconciliationStatus.RECONCILING) {
      this.logger.log(
        `SAN ${id} already reconciling — skipping duplicate trigger`,
      );
      return;
    }

    await this.repository.update(id, {
      reconciliationStatus: ReconciliationStatus.RECONCILING,
      errorMessage: null,
    });

    try {
      const cluster = await this.clusterRepository.findOne({
        where: { id: entity.clusterId },
      });
      if (!cluster) {
        throw new NotFoundException(`Cluster ${entity.clusterId} not found`);
      }
      const kubeconfig = await this.getKubeconfig(cluster);

      await this.reflectorInstaller.ensureInstalled(kubeconfig);
      await this.applyMasterCertificate(entity, kubeconfig);
      const ready = await this.waitMasterSecretReady(entity, kubeconfig);

      await this.repository.update(id, {
        status: ready ? CertificateStatus.VALID : CertificateStatus.ISSUING,
        reconciliationStatus: ready
          ? ReconciliationStatus.IN_SYNC
          : ReconciliationStatus.RECONCILING,
        lastReconciliationAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`SAN ${id} reconciliation failed: ${message}`);
      await this.repository.update(id, {
        status: CertificateStatus.FAILED,
        reconciliationStatus: ReconciliationStatus.ERROR,
        lastReconciliationAt: new Date(),
        errorMessage: message,
      });
      throw err;
    }
  }

  /**
   * Materializes the SAN TLS Secret in `targetNamespace` (copies bytes from
   * master + sets reflector annotation). No-op if the master is not yet
   * populated. Returns whether the master Secret is ready.
   */
  async ensureForEndpoint(
    sanCertificateId: string,
    targetNamespace: string,
    fqdn: string,
  ): Promise<EnsureSanResult> {
    const entity = await this.getById(sanCertificateId);
    const normalized = fqdn.trim().toLowerCase();
    if (!entity.dnsNames.includes(normalized)) {
      throw new BadRequestException(
        `fqdn "${fqdn}" is not part of SAN certificate ${sanCertificateId} (dnsNames: ${entity.dnsNames.join(', ')})`,
      );
    }

    const cluster = await this.clusterRepository.findOne({
      where: { id: entity.clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${entity.clusterId} not found`);
    }
    const kubeconfig = await this.getKubeconfig(cluster);

    const ready = await this.isMasterSecretReady(entity, kubeconfig);
    if (ready) {
      await this.ensureDistribution(entity, targetNamespace, kubeconfig);
    } else {
      this.logger.warn(
        `SAN ${sanCertificateId} master Secret not ready — endpoint Ingress will use empty placeholder until reflector syncs`,
      );
    }

    return {
      sanCertificateId: entity.id,
      tlsSecretName: entity.masterSecretName,
      ready,
    };
  }

  private async applyMasterCertificate(
    entity: SanCertificateEntity,
    kubeconfig: string,
  ): Promise<void> {
    await this.ensureNamespace(entity.masterNamespace, kubeconfig);
    const manifest = this.acmeCertificateService.generateCertificateManifest({
      name: entity.masterCertName,
      namespace: entity.masterNamespace,
      secretName: entity.masterSecretName,
      issuerName: entity.issuerName,
      domains: entity.dnsNames,
    });
    await this.kubernetesService.applyManifest(kubeconfig, manifest);
    this.logger.log(
      `Applied SAN Certificate ${entity.masterNamespace}/${entity.masterCertName} (${entity.dnsNames.length} dnsNames)`,
    );
  }

  private async ensureNamespace(
    namespace: string,
    kubeconfig: string,
  ): Promise<void> {
    const manifest = [
      'apiVersion: v1',
      'kind: Namespace',
      'metadata:',
      `  name: ${namespace}`,
      '  labels:',
      '    managed-by: flui-cloud',
      '',
    ].join('\n');
    await this.kubernetesService.applyManifest(kubeconfig, manifest);
  }

  private async waitMasterSecretReady(
    entity: SanCertificateEntity,
    kubeconfig: string,
  ): Promise<boolean> {
    try {
      await this.kubernetesService.waitForSecret(
        kubeconfig,
        entity.masterSecretName,
        entity.masterNamespace,
        SanCertificateService.MASTER_READY_TIMEOUT_MS,
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `SAN master Secret ${entity.masterNamespace}/${entity.masterSecretName} not ready: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  private async isMasterSecretReady(
    entity: SanCertificateEntity,
    kubeconfig: string,
  ): Promise<boolean> {
    const master = await this.kubernetesService.getResource(
      kubeconfig,
      'Secret',
      entity.masterSecretName,
      entity.masterNamespace,
    );
    const data = (master?.body ?? master)?.data ?? {};
    return !!data['tls.crt'] && !!data['tls.key'];
  }

  private async ensureDistribution(
    entity: SanCertificateEntity,
    targetNamespace: string,
    kubeconfig: string,
  ): Promise<void> {
    if (targetNamespace === entity.masterNamespace) {
      return;
    }

    const master = await this.kubernetesService.getResource(
      kubeconfig,
      'Secret',
      entity.masterSecretName,
      entity.masterNamespace,
    );
    const masterBody = master?.body ?? master;
    const masterData = masterBody?.data ?? {};
    const masterCrt = masterData['tls.crt'];
    const masterKey = masterData['tls.key'];
    if (!masterCrt || !masterKey) {
      this.logger.warn(
        `SAN master Secret ${entity.masterNamespace}/${entity.masterSecretName} not yet populated — skipping distribution`,
      );
      return;
    }

    const reflectsValue = `${entity.masterNamespace}/${entity.masterSecretName}`;
    const existing = await this.kubernetesService.getResource(
      kubeconfig,
      'Secret',
      entity.masterSecretName,
      targetNamespace,
    );
    const existingBody = existing?.body ?? existing;
    const existingData = existingBody?.data ?? {};
    const existingReflects =
      existingBody?.metadata?.annotations?.[
        'reflector.v1.k8s.emberstack.com/reflects'
      ];

    const inSync =
      existing &&
      existingData['tls.crt'] === masterCrt &&
      existingData['tls.key'] === masterKey &&
      existingReflects === reflectsValue;
    if (inSync) return;

    if (existing && existingReflects !== reflectsValue) {
      this.logger.warn(
        `Replacing stale Secret ${targetNamespace}/${entity.masterSecretName} (reflects=${existingReflects ?? 'none'}) with SAN replica`,
      );
      await this.kubernetesService.deleteResource(
        kubeconfig,
        'Secret',
        entity.masterSecretName,
        targetNamespace,
      );
    }

    const manifest = [
      'apiVersion: v1',
      'kind: Secret',
      'type: kubernetes.io/tls',
      'metadata:',
      `  name: ${entity.masterSecretName}`,
      `  namespace: ${targetNamespace}`,
      '  labels:',
      '    managed-by: flui-cloud',
      '    flui-resource-type: san-certificate-replica',
      '  annotations:',
      `    reflector.v1.k8s.emberstack.com/reflects: "${reflectsValue}"`,
      'data:',
      `  tls.crt: ${masterCrt}`,
      `  tls.key: ${masterKey}`,
      '',
    ].join('\n');
    await this.kubernetesService.applyManifest(kubeconfig, manifest);
    this.logger.log(
      `Materialized SAN Secret replica ${targetNamespace}/${entity.masterSecretName} (reflects ${reflectsValue})`,
    );
  }

  private async getKubeconfig(cluster: ClusterEntity): Promise<string> {
    if (!cluster.kubeconfigEncrypted) {
      throw new Error(`Cluster ${cluster.id} has no kubeconfig`);
    }
    const kubeconfig = this.encryptionService.decrypt(
      cluster.kubeconfigEncrypted,
    );
    return this.kubernetesService.patchKubeconfigServer(kubeconfig);
  }
}
