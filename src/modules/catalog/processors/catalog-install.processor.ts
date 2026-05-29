import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InfrastructureOperationEntity,
  OperationStatus,
  OperationStep,
} from '../../infrastructure/servers/entities/infrastructure-operations.entity';
import { ApplicationService } from '../../applications/services/application.service';
import { ApplicationDeployService } from '../../applications/services/application-deploy.service';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import { DeployConfigService } from '../../applications/services/deploy-config.service';
import { ApplicationStatus } from '../../applications/enums/application-status.enum';
import { ApplicationSourceType } from '../../applications/enums/application-source-type.enum';
import { ApplicationCategory } from '../../applications/enums/application-category.enum';

import { mapCatalogCategoryToKind } from '../utils/category-to-kind';
import { ApplicationExposure } from '../../applications/enums/application-exposure.enum';
import { CreateApplicationDto } from '../../applications/dto/create-application.dto';
import {
  ApplicationScaling,
  ApplicationHealthProbe,
} from '../../applications/interfaces/source-config.interface';
import { AppEndpointService } from '../../dns/services/app-endpoint.service';
import { AppEndpointReconciliationService } from '../../dns/services/app-endpoint-reconciliation.service';
import { ClusterDnsZoneService } from '../../dns/services/cluster-dns-zone.service';
import { CertChallenge } from '../../dns/enums/cert-challenge.enum';
import { HostnameMode } from '../../dns/enums/hostname-mode.enum';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import {
  CatalogDomainSpec,
  CatalogSpecStandalone,
  CatalogSpecBuildingBlock,
  CatalogSpecComposed,
  CatalogComponent,
  CatalogEnvVar,
  CatalogHealthcheck,
  CatalogImageSource,
  CatalogResources,
  CatalogScaling,
  CatalogVolume,
} from '../interfaces/catalog-manifest.interface';
import { CatalogAppDefinitionRepository } from '../repositories/catalog-app-definition.repository';
import { CatalogInstallRepository } from '../repositories/catalog-install.repository';
import { CatalogInstallEntity } from '../entities/catalog-install.entity';
import { CatalogAppDefinitionEntity } from '../entities/catalog-app-definition.entity';
import { CatalogInstallStatus } from '../enums/catalog-install-status.enum';
import { CatalogAppType } from '../enums/catalog-app-type.enum';
import { TemplateContext } from '../interfaces/template-context.interface';
import { CatalogTemplateResolverService } from '../services/catalog-template-resolver.service';
import { CatalogSecretGeneratorService } from '../services/catalog-secret-generator.service';
import { CatalogDependencyResolverService } from '../services/catalog-dependency-resolver.service';
import {
  CATALOG_INSTALL_QUEUE,
  CATALOG_INSTALL_JOB,
  CATALOG_UNINSTALL_JOB,
  CatalogInstallerService,
  CatalogInstallJobData,
  CatalogUninstallJobData,
} from '../services/catalog-installer.service';
import { buildUserNamespace } from '../../applications/utils/k8s-namespace.util';

interface ResolvedEnv {
  name: string;
  value: string;
  secret: boolean;
  externalSecretRef?: { secretName: string; key: string };
}

@Processor(CATALOG_INSTALL_QUEUE)
export class CatalogInstallProcessor {
  private readonly logger = new Logger(CatalogInstallProcessor.name);

  constructor(
    @InjectRepository(InfrastructureOperationEntity)
    private readonly operationRepo: Repository<InfrastructureOperationEntity>,
    private readonly definitionRepo: CatalogAppDefinitionRepository,
    private readonly installRepo: CatalogInstallRepository,
    private readonly applicationService: ApplicationService,
    private readonly applicationRepo: ApplicationsRepository,
    private readonly deployService: ApplicationDeployService,
    private readonly appEndpointService: AppEndpointService,
    private readonly appEndpointReconciliationService: AppEndpointReconciliationService,
    private readonly clusterDnsZoneService: ClusterDnsZoneService,
    private readonly templateResolver: CatalogTemplateResolverService,
    private readonly secretGenerator: CatalogSecretGeneratorService,
    private readonly deployConfig: DeployConfigService,
    private readonly dependencyResolver: CatalogDependencyResolverService,
    private readonly installerService: CatalogInstallerService,
  ) {}

  @Process({ name: CATALOG_INSTALL_JOB, concurrency: 5 })
  async handleInstall(job: Job<CatalogInstallJobData>): Promise<void> {
    const { installId, operationId } = job.data;
    this.logger.log(`Processing catalog install ${installId}`);

    try {
      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        0,
        OperationStep.CATALOG_INSTALL_INIT,
      );
      await this.installRepo.updateStatus(
        installId,
        CatalogInstallStatus.INSTALLING,
      );

      const install = await this.installRepo.findById(installId);
      if (!install) {
        throw new Error(`Install ${installId} not found`);
      }
      const definition = await this.definitionRepo.findById(
        install.catalogAppDefinitionId,
      );
      if (!definition) {
        throw new Error(
          `Catalog definition ${install.catalogAppDefinitionId} not found`,
        );
      }

      const manifest = definition.manifest;
      if (manifest.spec.type === CatalogAppType.COMPOSED) {
        await this.handleComposedInstall(
          install,
          definition,
          manifest.spec,
          operationId,
        );
        return;
      }
      const spec = manifest.spec;

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        10,
        OperationStep.CATALOG_INSTALL_RESOLVE_DEPS,
      );

      const deps =
        spec.type === CatalogAppType.STANDALONE ||
        spec.type === CatalogAppType.BUILDING_BLOCK
          ? (spec.dependencies ?? [])
          : [];
      this.logger.log(
        `[deps-debug] install=${install.id} type=${spec.type} deps=${JSON.stringify(deps)} choices=${JSON.stringify(install.dependencyChoices)}`,
      );
      const depResolution = deps.length
        ? await this.dependencyResolver.resolveAll(
            deps,
            install.dependencyChoices ?? [],
            install.clusterId,
            install.userId,
            install.userEmail,
          )
        : {
            resolved: [],
            dedicatedInstallIds: [],
            secretKeysByAlias: {},
            secretNameByAlias: {},
          };
      this.logger.log(
        `[deps-debug] install=${install.id} resolved=${JSON.stringify(depResolution.resolved.map((r) => ({ alias: r.alias, host: r.host, port: r.port, envKeys: Object.keys(r.env) })))}`,
      );

      if (depResolution.dedicatedInstallIds.length) {
        await this.installRepo.update(install.id, {
          dependencyInstallIds: depResolution.dedicatedInstallIds,
        });
      }

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        20,
        OperationStep.CATALOG_INSTALL_GENERATE_SECRETS,
      );

      const resolvedEnv = this.resolveEnv(spec.env, install);

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        30,
        OperationStep.CATALOG_INSTALL_RESOLVE_TEMPLATES,
      );

      const ctx = this.buildTemplateContext(install, resolvedEnv);
      ctx.deps = Object.fromEntries(
        depResolution.resolved.map((d) => [
          d.alias,
          { host: d.host, port: d.port, env: d.env },
        ]),
      );
      const finalEnv = this.substituteEnvValuesWithDeps(
        spec.env,
        resolvedEnv,
        ctx,
        depResolution.secretKeysByAlias,
        depResolution.secretNameByAlias,
      );

      // NB: linking for clients (manifest with spec.linkedBuildingBlocks) is
      // never resolved at install-time anymore. Clients start parked
      // (replicas=0) and pick up env on the first POST /installs/:id/connect.
      ctx.env = Object.fromEntries(finalEnv.map((e) => [e.name, e.value]));

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        40,
        OperationStep.CATALOG_INSTALL_CREATE_APPLICATIONS,
      );

      const dto = this.buildCreateApplicationDto(
        definition,
        install,
        spec,
        finalEnv,
        ctx,
      );
      const application = await this.applicationService.create(
        install.clusterId,
        dto,
        install.userId,
        install.userEmail,
      );

      await this.installRepo.update(install.id, {
        applicationIds: [application.id],
      });

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        50,
        OperationStep.CATALOG_INSTALL_DEPLOY_COMPONENTS,
      );

      const imageRef = this.buildImageRef(spec.image);
      const deployOp = await this.deployService.triggerDeployWithImage(
        application.id,
        imageRef,
        install.userId,
      );

      const deployResult = await this.waitForDeployOperation(
        deployOp.id,
        application.id,
        this.deployConfig.getCatalogInstallWaitTimeoutMs(),
        this.deployConfig.getCatalogInstallPollIntervalMs(),
      );
      if (!deployResult.ok) {
        throw new Error(
          `Deploy failed for application ${application.id}: ${deployResult.error ?? 'unknown'}`,
        );
      }

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        85,
        OperationStep.CATALOG_INSTALL_CREATE_ENDPOINTS,
      );

      if (spec.type === CatalogAppType.STANDALONE) {
        if (dto.exposure === ApplicationExposure.INTERNAL) {
          this.logger.log(
            `Install ${install.id}: exposure=internal — skipping public endpoint (no Ingress/DNS/Certificate); app reachable via ForwardAuth proxy`,
          );
        } else {
          await this.maybeCreateEndpoint(install, application.id, spec);
        }
      }

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        95,
        OperationStep.CATALOG_INSTALL_FINALIZE,
      );

      await this.installRepo.updateStatus(
        install.id,
        CatalogInstallStatus.RUNNING,
      );
      await this.updateOperation(
        operationId,
        OperationStatus.COMPLETED,
        100,
        OperationStep.CATALOG_INSTALL_FINALIZE,
      );

      this.logger.log(`Catalog install ${install.id} completed`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Catalog install ${installId} failed: ${message}`);
      await this.installRepo.updateStatus(
        installId,
        CatalogInstallStatus.FAILED,
        message,
      );
      await this.updateOperation(
        operationId,
        OperationStatus.FAILED,
        undefined,
        undefined,
        message,
      );
      throw err;
    }
  }

  @Process(CATALOG_UNINSTALL_JOB)
  async handleUninstall(job: Job<CatalogUninstallJobData>): Promise<void> {
    const { installId, operationId } = job.data;
    this.logger.log(`Processing catalog uninstall ${installId}`);

    try {
      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        0,
        OperationStep.CATALOG_UNINSTALL_INIT,
      );

      const install = await this.installRepo.findById(installId);
      if (!install) {
        throw new Error(`Install ${installId} not found`);
      }

      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        20,
        OperationStep.CATALOG_UNINSTALL_DELETE_APPS,
      );

      for (const appId of install.applicationIds) {
        try {
          await this.deployService.deleteApplication(appId, install.userId);
        } catch (err) {
          this.logger.warn(
            `Failed to delete application ${appId} during uninstall ${install.id}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }

      for (const depInstallId of install.dependencyInstallIds ?? []) {
        try {
          await this.installerService.uninstall(depInstallId, install.userId);
          this.logger.log(
            `Cascade-uninstalled dedicated dep ${depInstallId} for install ${install.id}`,
          );
        } catch (err) {
          this.logger.warn(
            `Failed to cascade-uninstall dep ${depInstallId} of install ${install.id}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }

      await this.installRepo.update(install.id, {
        status: CatalogInstallStatus.UNINSTALLED,
        deletedAt: new Date(),
      });

      await this.updateOperation(
        operationId,
        OperationStatus.COMPLETED,
        100,
        OperationStep.CATALOG_UNINSTALL_FINALIZE,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Catalog uninstall ${installId} failed: ${message}`);
      await this.updateOperation(
        operationId,
        OperationStatus.FAILED,
        undefined,
        undefined,
        message,
      );
      throw err;
    }
  }

  private resolveEnv(
    envSpec: CatalogEnvVar[],
    install: CatalogInstallEntity,
  ): ResolvedEnv[] {
    const out: ResolvedEnv[] = [];
    for (const e of envSpec) {
      const override = install.envOverrides?.[e.name];

      if (e.valueFrom && 'generate' in e.valueFrom) {
        out.push({
          name: e.name,
          value: this.secretGenerator.generate(
            e.valueFrom.length,
            e.valueFrom.format ?? 'base64url',
          ),
          secret: true,
        });
        continue;
      }
      if (e.valueFrom && 'userInput' in e.valueFrom) {
        const provided =
          install.userInputs?.[e.name] ?? e.valueFrom.userInput.default ?? '';
        out.push({
          name: e.name,
          value: provided,
          secret: !!e.valueFrom.userInput.sensitive,
        });
        continue;
      }
      if (e.valueFrom && 'secretRef' in e.valueFrom) {
        throw new Error(
          `valueFrom.secretRef is not supported in Iteration 1 (var ${e.name})`,
        );
      }

      const rawValue = override ?? e.value ?? '';
      out.push({ name: e.name, value: rawValue, secret: false });
    }
    return out;
  }

  private buildTemplateContext(
    install: CatalogInstallEntity,
    env: ResolvedEnv[],
  ): TemplateContext {
    const namespace = install.userEmail
      ? buildUserNamespace(install.userEmail)
      : 'default';
    return {
      app: {
        id: install.slug,
        slug: install.slug,
        domain: install.requestedDomain,
        namespace,
      },
      env: Object.fromEntries(env.map((e) => [e.name, e.value])),
    };
  }

  private substituteEnvValuesWithDeps(
    envSpec: CatalogEnvVar[],
    env: ResolvedEnv[],
    ctx: TemplateContext,
    secretKeysByAlias: Record<string, Set<string>>,
    secretNameByAlias: Record<string, string>,
  ): ResolvedEnv[] {
    const EXACT_DEP_SECRET = /^\{\{\s*deps\.([^.]+)\.env\.([^.}\s]+)\s*\}\}$/;
    const ANY_DEP_SECRET = /\{\{\s*deps\.([^.]+)\.env\.([^.}\s]+)\s*\}\}/g;

    return env.map((e, idx) => {
      const rawValue = envSpec[idx]?.value ?? e.value;
      const raw = rawValue ?? '';

      const exactMatch = EXACT_DEP_SECRET.exec(raw);
      if (exactMatch) {
        const [, alias, key] = exactMatch;
        const secretKeys = secretKeysByAlias[alias];
        const secretName = secretNameByAlias[alias];
        if (secretKeys?.has(key) && secretName) {
          return {
            name: e.name,
            value: '',
            secret: true,
            externalSecretRef: { secretName, key },
          };
        }
      }

      let referencesSecret = false;
      const matches = raw.matchAll(ANY_DEP_SECRET);
      for (const m of matches) {
        const alias = m[1];
        const key = m[2];
        if (secretKeysByAlias[alias]?.has(key)) {
          referencesSecret = true;
          break;
        }
      }

      return {
        name: e.name,
        value: this.templateResolver.resolve(e.value, ctx),
        secret: e.secret || referencesSecret,
      };
    });
  }

  private buildCreateApplicationDto(
    definition: CatalogAppDefinitionEntity,
    install: CatalogInstallEntity,
    spec: CatalogSpecStandalone | CatalogSpecBuildingBlock,
    env: ResolvedEnv[],
    ctx: TemplateContext,
  ): CreateApplicationDto {
    const primaryPort = spec.ports[0];
    const imageRef = this.buildImageRef(spec.image);
    const isBuildingBlock =
      definition.appType === CatalogAppType.BUILDING_BLOCK;
    const manifestExposure: 'public' | 'internal' =
      spec.type === CatalogAppType.STANDALONE
        ? (spec.exposure ?? 'public')
        : 'public';
    const privatizable =
      !isBuildingBlock &&
      manifestExposure !== 'internal' &&
      (spec.type === CatalogAppType.STANDALONE
        ? spec.privatizable !== false
        : false);
    const effectiveExposure: 'public' | 'internal' =
      privatizable && install.requestedExposure === 'internal'
        ? 'internal'
        : manifestExposure;
    const exposure: ApplicationExposure =
      isBuildingBlock || effectiveExposure === 'internal'
        ? ApplicationExposure.INTERNAL
        : ApplicationExposure.PUBLIC;

    this.logger.log(
      `[exposure-debug] install=${install.id} slug=${install.slug} ` +
        `requestedExposure=${install.requestedExposure} ` +
        `spec.type=${spec.type} spec.exposure=${(spec as any).exposure} spec.privatizable=${(spec as any).privatizable} ` +
        `isBuildingBlock=${isBuildingBlock} manifestExposure=${manifestExposure} ` +
        `privatizable=${privatizable} effectiveExposure=${effectiveExposure} ` +
        `→ exposure=${exposure}`,
    );

    return {
      name: install.slug,
      description: definition.description,
      category: ApplicationCategory.USER,
      kind: definition.appKind ?? mapCatalogCategoryToKind(definition.category),
      sourceType: ApplicationSourceType.DOCKER_IMAGE,
      k8sNamespace: ctx.app.namespace,
      sourceConfig: {
        type: 'docker_image',
        imageRef,
        pullPolicy: 'IfNotPresent',
      },
      env: env.map((e) => ({
        name: e.name,
        value: e.value,
        secret: e.secret,
        externalSecretRef: e.externalSecretRef,
      })),
      resources: this.applyResourceOverrides(
        this.mapResources(spec.resources),
        install.resourceOverrides,
      ),
      scaling: this.mapScaling(spec.scaling),
      replicas: this.resolveReplicas(spec, install.resourceOverrides),
      port: primaryPort?.internal,
      healthProbe: this.mapHealthProbe(
        this.resolveHealthcheckTemplates(spec.healthcheck, ctx),
        primaryPort?.internal,
      ),
      volumes: this.mapVolumes(spec.volumes),
      workloadKind: isBuildingBlock ? 'StatefulSet' : 'Deployment',
      persistenceScope: spec.persistence?.scope ?? 'shared',
      allowMasterPlacement: spec.persistence?.allowMaster ?? false,
      startCommand: spec.startCommand,
      labels: {
        'flui.cloud/catalog-app': definition.slug,
        'flui.cloud/catalog-install': install.id,
        'flui.cloud/app-type': definition.appType,
      },
      metadata: {
        catalogInstallId: install.id,
        catalogDefinitionId: definition.id,
        catalogVersion: definition.version,
      },
      exposure,
    };
  }

  private async maybeCreateEndpoint(
    install: CatalogInstallEntity,
    applicationId: string,
    spec: CatalogSpecStandalone,
  ): Promise<void> {
    const exposedPort = spec.ports.find((p) => p.expose);
    if (!exposedPort || spec.domain?.auto === false) {
      this.logger.log(
        `Install ${install.id}: no exposed port or domain.auto=false — skipping endpoint`,
      );
      return;
    }

    if (install.skipEndpoint) {
      this.logger.log(
        `Install ${install.id}: skipEndpoint=true — user will configure domain/TLS later`,
      );
      return;
    }

    const assignment = install.requestedDomain
      ? await this.clusterDnsZoneService.getZoneForFqdn(
          install.clusterId,
          install.requestedDomain,
        )
      : await this.clusterDnsZoneService.getZoneAssignment(install.clusterId);
    const wildcardIssuer = assignment?.dnsZone?.zoneName
      ? await this.clusterDnsZoneService.resolveWildcardIssuer(
          install.clusterId,
        )
      : null;

    const domainHints = this.mapDomainSpecToEndpointDto(
      spec.domain,
      wildcardIssuer?.certificateProvider,
    );
    const certificateRequired = spec.domain?.tls !== false;

    try {
      const endpoint = await this.appEndpointService.createEndpoint(
        install.clusterId,
        {
          applicationId,
          fqdn: install.requestedDomain,
          clusterDnsZoneId: assignment?.id,
          certificateRequired,
          ...domainHints,
        },
      );
      await this.installRepo.update(install.id, {
        resolvedFqdn: endpoint.fqdn,
      });
      this.logger.log(
        `Install ${install.id}: endpoint created fqdn=${endpoint.fqdn} mode=${endpoint.hostnameMode}/${endpoint.certChallenge} tls=${certificateRequired}`,
      );

      // Reconciliation is idempotent and can take a few seconds (DNS record
      // creation on the provider + Ingress apply on the cluster). Fire and
      // forget: if it errors we log, the endpoint row stays PENDING and the
      // UI can retry via POST /clusters/:id/app-endpoints/:id/reconcile.
      void this.appEndpointReconciliationService
        .reconcile(endpoint.id)
        .catch((err) =>
          this.logger.warn(
            `Endpoint reconciliation failed for ${endpoint.id} (install ${install.id}): ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
    } catch (err) {
      this.logger.warn(
        `Endpoint provisioning failed for install ${install.id}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private mapDomainSpecToEndpointDto(
    domain: CatalogDomainSpec | undefined,
    fallbackCertProvider: CertificateProvider | undefined,
  ): {
    hostnameMode?: HostnameMode;
    certChallenge?: CertChallenge;
    certificateProvider?: CertificateProvider;
  } {
    let hostnameMode: HostnameMode | undefined;
    if (domain?.hostnameMode === 'ip') hostnameMode = HostnameMode.IP;
    else if (domain?.hostnameMode === 'domain')
      hostnameMode = HostnameMode.DOMAIN;

    let certChallenge: CertChallenge | undefined;
    if (domain?.certChallenge === 'http-01')
      certChallenge = CertChallenge.HTTP_01;
    else if (domain?.certChallenge === 'dns-01')
      certChallenge = CertChallenge.DNS_01;

    let certificateProvider: CertificateProvider | undefined;
    if (domain?.certificateProvider === 'lets-encrypt-staging') {
      certificateProvider = CertificateProvider.LETS_ENCRYPT_STAGING;
    } else if (domain?.certificateProvider === 'lets-encrypt') {
      certificateProvider = CertificateProvider.LETS_ENCRYPT;
    } else {
      certificateProvider = fallbackCertProvider;
    }

    return { hostnameMode, certChallenge, certificateProvider };
  }

  private buildImageRef(image: CatalogImageSource): string {
    if (image.source) {
      throw new Error('Build-from-git images are not supported in Iteration 1');
    }
    const registry = image.registry ?? 'docker.io';
    const repository = image.repository ?? '';
    const tag = image.tag ?? 'latest';
    if (!repository) {
      throw new Error('image.repository is required');
    }
    const prefix = registry === 'docker.io' ? '' : `${registry}/`;
    return `${prefix}${repository}:${tag}`;
  }

  private mapVolumes(
    volumes: CatalogVolume[] | undefined,
  ): CreateApplicationDto['volumes'] {
    if (!volumes?.length) return [];
    return volumes.map((v) => ({
      name: v.name,
      mountPath: v.mountPath,
      size: v.size ?? '1Gi',
    }));
  }

  private mapResources(r: CatalogResources): CreateApplicationDto['resources'] {
    return {
      cpu: {
        request: r.requests?.cpu,
        limit: r.limits?.cpu,
      },
      memory: {
        request: r.requests?.memory,
        limit: r.limits?.memory,
      },
    };
  }

  /**
   * Merge user-supplied resource overrides onto the manifest defaults.
   * Each field is individually overridable; omitted fields keep the default.
   * Used when the install request includes `resourceOverrides` to let users
   * scale down on constrained clusters or bump up preventively.
   */
  private applyResourceOverrides(
    base: CreateApplicationDto['resources'],
    overrides: CatalogInstallEntity['resourceOverrides'],
  ): CreateApplicationDto['resources'] {
    if (!overrides) return base;
    return {
      cpu: {
        request: overrides.cpu?.request ?? base?.cpu?.request,
        limit: overrides.cpu?.limit ?? base?.cpu?.limit,
      },
      memory: {
        request: overrides.memory?.request ?? base?.memory?.request,
        limit: overrides.memory?.limit ?? base?.memory?.limit,
      },
    };
  }

  /**
   * Initial replica count for the Deployment. User override wins; otherwise
   * use the manifest's horizontal.min when HPA is enabled, else 1.
   */
  private resolveReplicas(
    spec: CatalogSpecStandalone | CatalogSpecBuildingBlock,
    overrides: CatalogInstallEntity['resourceOverrides'],
  ): number {
    if (overrides?.replicas !== undefined) return overrides.replicas;
    if (spec.scaling.horizontal.enabled) {
      return spec.scaling.horizontal.min ?? 1;
    }
    return 1;
  }

  private mapScaling(s: CatalogScaling): ApplicationScaling {
    const horizontal = {
      enabled: s.horizontal.enabled,
      min: s.horizontal.min,
      max: s.horizontal.max,
      metrics: s.horizontal.metrics?.map((m) => ({
        type: m.type === 'custom' ? 'cpu' : m.type,
        utilization: m.target.value,
      })),
      behavior: s.horizontal.behavior
        ? {
            scaleUp: s.horizontal.behavior.scaleUp
              ? {
                  stabilizationWindowSeconds: this.parseDurationSeconds(
                    s.horizontal.behavior.scaleUp.stabilizationWindow,
                  ),
                  step: s.horizontal.behavior.scaleUp.step,
                }
              : undefined,
            scaleDown: s.horizontal.behavior.scaleDown
              ? {
                  stabilizationWindowSeconds: this.parseDurationSeconds(
                    s.horizontal.behavior.scaleDown.stabilizationWindow,
                  ),
                  step: s.horizontal.behavior.scaleDown.step,
                }
              : undefined,
          }
        : undefined,
    };

    const vertical = {
      enabled: s.vertical.enabled,
      mode: (s.vertical.mode ?? 'Off') as
        | 'Off'
        | 'Initial'
        | 'Recreate'
        | 'Auto',
      bounds: s.vertical.bounds,
      updatePolicy: s.vertical.updatePolicy
        ? {
            trigger: s.vertical.updatePolicy.trigger,
            cooldownSeconds: s.vertical.updatePolicy.cooldown
              ? this.parseDurationSeconds(s.vertical.updatePolicy.cooldown)
              : undefined,
          }
        : undefined,
    };

    const firstCpuMetric = s.horizontal.metrics?.find((m) => m.type === 'cpu');
    const firstMemoryMetric = s.horizontal.metrics?.find(
      (m) => m.type === 'memory',
    );

    return {
      enabled: s.horizontal.enabled,
      minReplicas: s.horizontal.min,
      maxReplicas: s.horizontal.max,
      targetCPU: firstCpuMetric?.target.value,
      targetMemory: firstMemoryMetric?.target.value,
      horizontal,
      vertical,
    };
  }

  /**
   * Resolve `{{env.X}}` / `{{app.Y}}` placeholders that appear inside a
   * healthcheck block (command args, http path, etc.). Env values and
   * template-only fields in `spec.env` already go through the resolver
   * upstream; healthchecks were missed in Iter 1 because they're out of the
   * env loop. Without this pass, a probe like
   *   exec: { command: ["pg_isready", "-U", "{{env.POSTGRES_USER}}"] }
   * reaches the pod with the literal "{{env.POSTGRES_USER}}" and the probe
   * always fails (pg_isready treats it as a user name).
   */
  private resolveHealthcheckTemplates(
    hc: CatalogHealthcheck | undefined,
    ctx: TemplateContext,
  ): CatalogHealthcheck | undefined {
    if (!hc) return hc;
    const resolved: CatalogHealthcheck = { ...hc };
    if (hc.command) {
      resolved.command = hc.command.map((p) =>
        this.templateResolver.resolve(p, ctx),
      );
    }
    if (hc.path) {
      resolved.path = this.templateResolver.resolve(hc.path, ctx);
    }
    return resolved;
  }

  private mapHealthProbe(
    hc: CatalogHealthcheck | undefined,
    port?: number,
  ): ApplicationHealthProbe | undefined {
    if (!hc) return undefined;
    const base: ApplicationHealthProbe = {
      type: hc.type,
      initialDelaySeconds: hc.initialDelay
        ? this.parseDurationSeconds(hc.initialDelay)
        : 30,
      periodSeconds: hc.interval ? this.parseDurationSeconds(hc.interval) : 10,
      timeoutSeconds: hc.timeout ? this.parseDurationSeconds(hc.timeout) : 5,
      failureThreshold: hc.retries ?? 3,
    };
    if (hc.type === 'http') {
      return {
        ...base,
        httpPath: hc.path ?? '/',
        httpPort: hc.port ?? port ?? 80,
      };
    }
    if (hc.type === 'tcp') {
      return { ...base, tcpPort: hc.port ?? port ?? 80 };
    }
    if (hc.type === 'exec') {
      return { ...base, execCommand: hc.command ?? [] };
    }
    return base;
  }

  private parseDurationSeconds(value: string): number {
    const match = /^(\d+)\s*([smh])?$/.exec(value.trim());
    if (!match) {
      throw new Error(
        `Invalid duration "${value}"; expected "60s", "5m", "1h"`,
      );
    }
    const n = Number.parseInt(match[1], 10);
    const unit = match[2] ?? 's';
    if (unit === 's') return n;
    if (unit === 'm') return n * 60;
    if (unit === 'h') return n * 3600;
    return n;
  }

  private async waitForDeployOperation(
    operationId: string,
    applicationId: string,
    timeoutMs: number,
    pollMs: number,
  ): Promise<{ ok: boolean; error?: string }> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const op = await this.operationRepo.findOne({
        where: { id: operationId },
      });
      if (!op) return { ok: false, error: 'deploy operation not found' };
      if (op.status === OperationStatus.COMPLETED) {
        const app = await this.applicationRepo.findById(applicationId);
        if (app?.status === ApplicationStatus.RUNNING) {
          return { ok: true };
        }
      }
      if (op.status === OperationStatus.FAILED) {
        return { ok: false, error: op.errorMessage ?? 'deploy failed' };
      }
      await this.sleep(pollMs);
    }
    return {
      ok: false,
      error: `deploy did not complete within ${timeoutMs}ms`,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async updateOperation(
    operationId: string,
    status: OperationStatus,
    progress?: number,
    currentStep?: OperationStep,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: Partial<InfrastructureOperationEntity> = { status };
    if (progress !== undefined) updateData.progress = progress;
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (errorMessage) updateData.errorMessage = errorMessage;
    if (status === OperationStatus.IN_PROGRESS) {
      updateData.startedAt = new Date();
    }
    if (
      status === OperationStatus.COMPLETED ||
      status === OperationStatus.FAILED
    ) {
      updateData.completedAt = new Date();
    }
    await this.operationRepo.update(operationId, updateData);
  }

  /**
   * Iter 4: composed stack install. Creates N applications (one per component)
   * in topological order, wires inter-component discovery via K8s DNS, and
   * provisions a single public endpoint on the component that declares an
   * exposed port. Each component can reference preceding ones via
   * `{{components.NAME.host}}` / `{{components.NAME.env.VAR}}` template paths.
   */
  private async handleComposedInstall(
    install: CatalogInstallEntity,
    definition: CatalogAppDefinitionEntity,
    spec: CatalogSpecComposed,
    operationId: string,
  ): Promise<void> {
    const order = this.topologicallySortComponents(spec.components);

    await this.updateOperation(
      operationId,
      OperationStatus.IN_PROGRESS,
      20,
      OperationStep.CATALOG_INSTALL_CREATE_APPLICATIONS,
    );

    const namespace = install.userEmail
      ? buildUserNamespace(install.userEmail)
      : 'default';
    const ctx: TemplateContext = {
      app: {
        id: install.slug,
        slug: install.slug,
        domain: install.requestedDomain,
        namespace,
      },
      env: {},
      components: {},
    };

    const applicationIds: string[] = [];
    const primaryComponent = this.pickPrimaryComponent(spec.components);

    for (let i = 0; i < order.length; i++) {
      const component = order[i];
      const componentSlug = `${install.slug}-${component.name}`;
      const componentHost = `${componentSlug}-svc.${namespace}.svc.cluster.local`;

      const resolvedEnv = this.resolveEnv(component.env, install);
      const componentCtx: TemplateContext = {
        ...ctx,
        env: Object.fromEntries(resolvedEnv.map((e) => [e.name, e.value])),
      };
      const substituted = resolvedEnv.map((e) => ({
        name: e.name,
        value: this.templateResolver.resolve(e.value, componentCtx),
        secret: e.secret,
        externalSecretRef: e.externalSecretRef,
      }));

      const isPrimary = component === primaryComponent;
      const dto = this.buildComponentCreateDto(
        definition,
        install,
        component,
        componentSlug,
        namespace,
        substituted,
        isPrimary,
      );

      const application = await this.applicationService.create(
        install.clusterId,
        dto,
        install.userId,
        install.userEmail,
      );
      applicationIds.push(application.id);
      await this.installRepo.update(install.id, { applicationIds });

      const progress = 20 + Math.floor((60 * (i + 1)) / order.length);
      await this.updateOperation(
        operationId,
        OperationStatus.IN_PROGRESS,
        progress,
        OperationStep.CATALOG_INSTALL_DEPLOY_COMPONENTS,
      );

      const imageRef = this.buildImageRef(component.image);
      const deployOp = await this.deployService.triggerDeployWithImage(
        application.id,
        imageRef,
        install.userId,
      );
      const deployResult = await this.waitForDeployOperation(
        deployOp.id,
        application.id,
        this.deployConfig.getCatalogInstallWaitTimeoutMs(),
        this.deployConfig.getCatalogInstallPollIntervalMs(),
      );
      if (!deployResult.ok) {
        throw new Error(
          `Deploy failed for component ${component.name} (app ${application.id}): ${deployResult.error ?? 'unknown'}`,
        );
      }

      ctx.components[component.name] = {
        host: componentHost,
        env: Object.fromEntries(substituted.map((e) => [e.name, e.value])),
      };
    }

    await this.updateOperation(
      operationId,
      OperationStatus.IN_PROGRESS,
      85,
      OperationStep.CATALOG_INSTALL_CREATE_ENDPOINTS,
    );

    if (primaryComponent && applicationIds.length) {
      const primaryIdx = order.indexOf(primaryComponent);
      const primaryAppId = applicationIds[primaryIdx];
      await this.maybeCreateComposedEndpoint(
        install,
        primaryAppId,
        spec,
        primaryComponent,
      );
    }

    await this.updateOperation(
      operationId,
      OperationStatus.IN_PROGRESS,
      95,
      OperationStep.CATALOG_INSTALL_FINALIZE,
    );
    await this.installRepo.updateStatus(
      install.id,
      CatalogInstallStatus.RUNNING,
    );
    await this.updateOperation(
      operationId,
      OperationStatus.COMPLETED,
      100,
      OperationStep.CATALOG_INSTALL_FINALIZE,
    );
    this.logger.log(
      `Composed install ${install.id} completed (${order.length} components)`,
    );
  }

  private topologicallySortComponents(
    components: CatalogComponent[],
  ): CatalogComponent[] {
    const byName = new Map(components.map((c) => [c.name, c]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const out: CatalogComponent[] = [];
    const visit = (c: CatalogComponent) => {
      if (visited.has(c.name)) return;
      if (visiting.has(c.name)) {
        throw new Error(
          `Cyclic dependsOn detected in composed components at "${c.name}"`,
        );
      }
      visiting.add(c.name);
      for (const depName of c.dependsOn ?? []) {
        const dep = byName.get(depName);
        if (!dep) {
          throw new Error(
            `Component "${c.name}" dependsOn unknown component "${depName}"`,
          );
        }
        visit(dep);
      }
      visiting.delete(c.name);
      visited.add(c.name);
      out.push(c);
    };
    for (const c of components) visit(c);
    return out;
  }

  private pickPrimaryComponent(
    components: CatalogComponent[],
  ): CatalogComponent | undefined {
    return components.find((c) => (c.ports ?? []).some((p) => p.expose));
  }

  private buildComponentCreateDto(
    definition: CatalogAppDefinitionEntity,
    install: CatalogInstallEntity,
    component: CatalogComponent,
    componentSlug: string,
    namespace: string,
    env: ResolvedEnv[],
    isPrimary: boolean,
  ): CreateApplicationDto {
    const imageRef = this.buildImageRef(component.image);
    const primaryPort = component.ports?.[0];
    const exposedPort = (component.ports ?? []).find((p) => p.expose);
    const exposure: ApplicationExposure =
      isPrimary && exposedPort
        ? ApplicationExposure.PUBLIC
        : ApplicationExposure.INTERNAL;

    return {
      name: componentSlug,
      description: definition.description,
      category: ApplicationCategory.USER,
      kind: definition.appKind ?? mapCatalogCategoryToKind(definition.category),
      sourceType: ApplicationSourceType.DOCKER_IMAGE,
      k8sNamespace: namespace,
      sourceConfig: {
        type: 'docker_image',
        imageRef,
        pullPolicy: 'IfNotPresent',
      },
      env: env.map((e) => ({
        name: e.name,
        value: e.value,
        secret: e.secret,
        externalSecretRef: e.externalSecretRef,
      })),
      resources: this.mapResources(component.resources),
      scaling: this.mapScaling(component.scaling),
      replicas: component.scaling.horizontal.enabled
        ? (component.scaling.horizontal.min ?? 1)
        : 1,
      port: primaryPort?.internal,
      healthProbe: component.healthcheck
        ? this.mapHealthProbe(component.healthcheck, primaryPort?.internal)
        : undefined,
      volumes: this.mapVolumes(component.volumes),
      workloadKind: (component.volumes ?? []).length
        ? 'StatefulSet'
        : 'Deployment',
      persistenceScope: component.persistence?.scope ?? 'shared',
      allowMasterPlacement: component.persistence?.allowMaster ?? false,
      labels: {
        'flui.cloud/catalog-app': definition.slug,
        'flui.cloud/catalog-install': install.id,
        'flui.cloud/app-type': definition.appType,
        'flui.cloud/composed-component': component.name,
      },
      metadata: {
        catalogInstallId: install.id,
        catalogDefinitionId: definition.id,
        catalogVersion: definition.version,
        composedComponent: component.name,
      },
      exposure,
    };
  }

  private async maybeCreateComposedEndpoint(
    install: CatalogInstallEntity,
    applicationId: string,
    spec: CatalogSpecComposed,
    primary: CatalogComponent,
  ): Promise<void> {
    if (install.skipEndpoint) {
      this.logger.log(
        `Composed install ${install.id}: skipEndpoint=true — user will configure domain/TLS later`,
      );
      return;
    }
    if (spec.domain?.auto === false) {
      this.logger.log(
        `Composed install ${install.id}: domain.auto=false — skipping endpoint`,
      );
      return;
    }
    const exposedPort = (primary.ports ?? []).find((p) => p.expose);
    if (!exposedPort) return;

    const assignment = install.requestedDomain
      ? await this.clusterDnsZoneService.getZoneForFqdn(
          install.clusterId,
          install.requestedDomain,
        )
      : await this.clusterDnsZoneService.getZoneAssignment(install.clusterId);
    const wildcardIssuer = assignment?.dnsZone?.zoneName
      ? await this.clusterDnsZoneService.resolveWildcardIssuer(
          install.clusterId,
        )
      : null;

    const domainHints = this.mapDomainSpecToEndpointDto(
      spec.domain,
      wildcardIssuer?.certificateProvider,
    );
    const certificateRequired = spec.domain?.tls !== false;

    try {
      const endpoint = await this.appEndpointService.createEndpoint(
        install.clusterId,
        {
          applicationId,
          fqdn: install.requestedDomain,
          clusterDnsZoneId: assignment?.id,
          certificateRequired,
          ...domainHints,
        },
      );
      await this.installRepo.update(install.id, {
        resolvedFqdn: endpoint.fqdn,
      });
      void this.appEndpointReconciliationService
        .reconcile(endpoint.id)
        .catch((err) =>
          this.logger.warn(
            `Composed endpoint reconciliation failed for ${endpoint.id}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
    } catch (err) {
      this.logger.warn(
        `Composed endpoint creation failed for install ${install.id}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
