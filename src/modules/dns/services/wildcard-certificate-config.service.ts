import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WildcardCertificateConfigService implements OnModuleInit {
  private static readonly ENV_KEY = 'FLUI_WILDCARD_CERTIFICATE_ENABLED';
  private static readonly MASTER_NAMESPACE = 'flui-system';
  private readonly logger = new Logger(WildcardCertificateConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const raw = this.configService.get<string | boolean | undefined>(
      WildcardCertificateConfigService.ENV_KEY,
    );
    this.logger.log(
      `[wildcard] ${WildcardCertificateConfigService.ENV_KEY}=${String(raw)} -> isEnabled=${this.isEnabled()}`,
    );
  }

  isEnabled(): boolean {
    const raw = this.configService.get<string | boolean | undefined>(
      WildcardCertificateConfigService.ENV_KEY,
    );
    if (raw === undefined || raw === null) return true;
    if (typeof raw === 'boolean') return raw;
    return String(raw).trim().toLowerCase() !== 'false';
  }

  getMasterNamespace(): string {
    return WildcardCertificateConfigService.MASTER_NAMESPACE;
  }
}
