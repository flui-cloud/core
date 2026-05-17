import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CatalogAppDefinitionRepository } from '../repositories/catalog-app-definition.repository';
import { CatalogInstallRepository } from '../repositories/catalog-install.repository';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import {
  CatalogLinkedBuildingBlock,
  CatalogSpecBuildingBlock,
} from '../interfaces/catalog-manifest.interface';

export interface ResolvedLinkedEnv {
  name: string;
  value: string;
  secret: boolean;
  externalSecretRef?: { secretName: string; key: string };
}

/**
 * Resolves the env vars a catalog client (e.g. pgweb) needs to talk to a
 * running building block (e.g. postgresql). Secrets are emitted as
 * `externalSecretRef` pointing to the BB's K8s Secret so passwords never
 * leave the cluster.
 *
 * Used from two places:
 *   - `CatalogInstallerService.connect` at Connect time (primary path)
 *   - integration/e2e tests
 */
@Injectable()
export class CatalogLinkingService {
  private readonly logger = new Logger(CatalogLinkingService.name);

  constructor(
    private readonly installRepo: CatalogInstallRepository,
    private readonly definitionRepo: CatalogAppDefinitionRepository,
    private readonly applicationsRepo: ApplicationsRepository,
  ) {}

  async resolveLinkedEnv(
    clientClusterId: string,
    linkedInstallId: string,
    linkedBlocks: CatalogLinkedBuildingBlock[],
  ): Promise<ResolvedLinkedEnv[]> {
    const bbInstall = await this.installRepo.findById(linkedInstallId);
    if (!bbInstall) {
      throw new BadRequestException(
        `Linked building-block install ${linkedInstallId} not found`,
      );
    }
    if (bbInstall.clusterId !== clientClusterId) {
      throw new BadRequestException(
        `Cross-cluster linking not supported: client on ${clientClusterId}, BB on ${bbInstall.clusterId}`,
      );
    }
    if (!bbInstall.applicationIds?.length) {
      throw new BadRequestException(
        `Linked building-block ${bbInstall.id} has no application yet (still installing?)`,
      );
    }
    const bbDefinition = await this.definitionRepo.findById(
      bbInstall.catalogAppDefinitionId,
    );
    if (!bbDefinition) {
      throw new BadRequestException(
        `Linked BB definition ${bbInstall.catalogAppDefinitionId} not found`,
      );
    }
    const linked = linkedBlocks.find((l) => l.ref === bbDefinition.slug);
    if (!linked) {
      throw new BadRequestException(
        `Client manifest does not declare linkedBuildingBlocks for BB "${bbDefinition.slug}" (declared refs: ${linkedBlocks.map((l) => l.ref).join(', ') || 'none'})`,
      );
    }
    const bbApp = await this.applicationsRepo.findById(
      bbInstall.applicationIds[0],
    );
    if (!bbApp) {
      throw new BadRequestException(
        `Linked building-block application ${bbInstall.applicationIds[0]} not found`,
      );
    }

    const bbSpec = bbDefinition.manifest.spec as CatalogSpecBuildingBlock;
    const bbSecretName = `${bbApp.slug}-secret`;
    const bbServiceHost = `${bbApp.slug}-svc.${bbApp.k8sNamespace}.svc.cluster.local`;
    const bbServicePort = bbSpec.ports[0]?.internal;

    const out: ResolvedLinkedEnv[] = [];
    for (const entry of linked.envMapping) {
      if (entry.fromService === 'host') {
        out.push({ name: entry.name, value: bbServiceHost, secret: false });
        continue;
      }
      if (entry.fromService === 'port') {
        out.push({
          name: entry.name,
          value: String(bbServicePort ?? ''),
          secret: false,
        });
        continue;
      }
      if (entry.value !== undefined) {
        out.push({ name: entry.name, value: entry.value, secret: false });
        continue;
      }
      if (entry.fromBBEnv) {
        const bbEnvSpec = bbSpec.env.find((e) => e.name === entry.fromBBEnv);
        if (!bbEnvSpec) {
          throw new BadRequestException(
            `Linked envMapping references ${entry.fromBBEnv} but the BB manifest has no such env`,
          );
        }
        const isSecret =
          !!bbEnvSpec.valueFrom &&
          ('generate' in bbEnvSpec.valueFrom ||
            ('userInput' in bbEnvSpec.valueFrom &&
              !!bbEnvSpec.valueFrom.userInput.sensitive));
        if (isSecret) {
          out.push({
            name: entry.name,
            value: '',
            secret: true,
            externalSecretRef: {
              secretName: bbSecretName,
              key: entry.fromBBEnv,
            },
          });
        } else {
          const bbAppEnv = bbApp.env?.find((e) => e.name === entry.fromBBEnv);
          out.push({
            name: entry.name,
            value: bbAppEnv?.value ?? '',
            secret: false,
          });
        }
        continue;
      }
      throw new BadRequestException(
        `Linked envMapping entry "${entry.name}" has no fromService, fromBBEnv, or value`,
      );
    }
    this.logger.log(
      `resolveLinkedEnv(→ ${bbApp.slug}): ${out.length} env entries (${out.filter((e) => e.externalSecretRef).length} secretKeyRef)`,
    );
    return out;
  }
}
