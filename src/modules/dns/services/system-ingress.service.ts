import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'node:fs';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { KubernetesService } from '../../infrastructure/shared/services/kubernetes.service';
import { EncryptionService } from '../../shared/encryption/services/encryption.service';
import { WildcardCertificateService } from './wildcard-certificate.service';
import { ConfigureSystemIngressDto } from '../dto/configure-system-ingress.dto';
import { getProjectPath } from '../../../common/utils/project-root.util';

@Injectable()
export class SystemIngressService {
  private readonly logger = new Logger(SystemIngressService.name);
  private static readonly MASTER_NAMESPACE = 'flui-system';

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    private readonly kubernetesService: KubernetesService,
    private readonly encryptionService: EncryptionService,
    private readonly wildcardCertificateService: WildcardCertificateService,
  ) {}

  async configureSystemIngress(
    clusterId: string,
    dto: ConfigureSystemIngressDto,
  ): Promise<void> {
    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });
    if (!cluster) {
      throw new NotFoundException(`Cluster ${clusterId} not found`);
    }

    const apiResult = await this.wildcardCertificateService.ensureForEndpoint(
      clusterId,
      dto.apiDomain,
      SystemIngressService.MASTER_NAMESPACE,
    );
    const appResult = await this.wildcardCertificateService.ensureForEndpoint(
      clusterId,
      dto.appDomain,
      SystemIngressService.MASTER_NAMESPACE,
    );

    if (!apiResult || !appResult) {
      throw new BadRequestException(
        `Wildcard certificate not available for ${dto.apiDomain} / ${dto.appDomain}. ` +
          `Ensure the wildcard feature flag is enabled and both FQDNs fall under the cluster's DNS zone.`,
      );
    }
    if (apiResult.tlsSecretName !== appResult.tlsSecretName) {
      throw new BadRequestException(
        `apiDomain and appDomain resolve to different wildcard scopes ` +
          `(${apiResult.tlsSecretName} vs ${appResult.tlsSecretName}). ` +
          `System apps must share a single wildcard scope.`,
      );
    }
    if (!apiResult.ready || !appResult.ready) {
      throw new ServiceUnavailableException(
        `Wildcard certificate for system apps is not Ready yet. ` +
          `Retry once the DNS-01 challenge completes.`,
      );
    }

    const tlsSecretName = apiResult.tlsSecretName;
    const kubeconfig = await this.getKubeconfig(cluster);

    const template = readFileSync(
      getProjectPath(
        'src',
        'modules',
        'dns',
        'templates',
        'system-ingress.yaml',
      ),
      'utf-8',
    );
    const manifest = template
      .replaceAll('{{API_DOMAIN}}', dto.apiDomain)
      .replaceAll('{{APP_DOMAIN}}', dto.appDomain)
      .replaceAll('{{TLS_SECRET_NAME}}', tlsSecretName);

    await this.kubernetesService.applyManifest(kubeconfig, manifest);
    this.logger.log(
      `Applied system Ingress for ${dto.apiDomain} and ${dto.appDomain} ` +
        `using wildcard secret ${tlsSecretName} on cluster ${clusterId}`,
    );
  }

  private async getKubeconfig(cluster: ClusterEntity): Promise<string> {
    if (!cluster.kubeconfigEncrypted) {
      throw new BadRequestException(
        `Cluster ${cluster.id} has no kubeconfig stored`,
      );
    }
    const kubeconfig = this.encryptionService.decrypt(
      cluster.kubeconfigEncrypted,
    );
    return this.kubernetesService.patchKubeconfigServer(kubeconfig);
  }
}
