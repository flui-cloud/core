import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeployConfigService {
  private static readonly ENV_READINESS_TIMEOUT_MS =
    'FLUI_DEPLOY_READINESS_TIMEOUT_MS';
  private static readonly ENV_READINESS_TIMEOUT_WITH_VOLUMES_MS =
    'FLUI_DEPLOY_READINESS_TIMEOUT_WITH_VOLUMES_MS';
  private static readonly ENV_CATALOG_INSTALL_WAIT_TIMEOUT_MS =
    'FLUI_CATALOG_INSTALL_WAIT_TIMEOUT_MS';
  private static readonly ENV_CATALOG_INSTALL_POLL_INTERVAL_MS =
    'FLUI_CATALOG_INSTALL_POLL_INTERVAL_MS';

  private static readonly DEFAULT_READINESS_TIMEOUT_MS = 5 * 60 * 1000;
  private static readonly DEFAULT_READINESS_TIMEOUT_WITH_VOLUMES_MS =
    10 * 60 * 1000;
  private static readonly DEFAULT_CATALOG_INSTALL_WAIT_TIMEOUT_MS =
    15 * 60 * 1000;
  private static readonly DEFAULT_CATALOG_INSTALL_POLL_INTERVAL_MS = 3_000;

  private readonly logger = new Logger(DeployConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  getReadinessTimeoutMs(hasVolumes: boolean): number {
    if (hasVolumes) {
      return this.readPositiveInt(
        DeployConfigService.ENV_READINESS_TIMEOUT_WITH_VOLUMES_MS,
        DeployConfigService.DEFAULT_READINESS_TIMEOUT_WITH_VOLUMES_MS,
      );
    }
    return this.readPositiveInt(
      DeployConfigService.ENV_READINESS_TIMEOUT_MS,
      DeployConfigService.DEFAULT_READINESS_TIMEOUT_MS,
    );
  }

  getCatalogInstallWaitTimeoutMs(): number {
    return this.readPositiveInt(
      DeployConfigService.ENV_CATALOG_INSTALL_WAIT_TIMEOUT_MS,
      DeployConfigService.DEFAULT_CATALOG_INSTALL_WAIT_TIMEOUT_MS,
    );
  }

  getCatalogInstallPollIntervalMs(): number {
    return this.readPositiveInt(
      DeployConfigService.ENV_CATALOG_INSTALL_POLL_INTERVAL_MS,
      DeployConfigService.DEFAULT_CATALOG_INSTALL_POLL_INTERVAL_MS,
    );
  }

  private readPositiveInt(key: string, defaultValue: number): number {
    const raw = this.configService.get<string | number | undefined>(key);
    if (raw === undefined || raw === null || raw === '') {
      return defaultValue;
    }
    const parsed =
      typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      this.logger.warn(
        `Invalid value for ${key}: "${raw}" — falling back to default ${defaultValue}ms`,
      );
      return defaultValue;
    }
    return parsed;
  }
}
