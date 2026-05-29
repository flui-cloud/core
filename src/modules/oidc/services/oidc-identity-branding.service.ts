import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IIdentityBranding } from '../../auth/interfaces/identity-branding.interface';
import {
  ClusterEntity,
  ClusterType,
} from '../../infrastructure/clusters/entities/cluster.entity';
import {
  BrandingAssetKind,
  OidcProviderAdminClient,
} from './oidc-provider-admin.service';
import { buildSystemNipHostname } from '../../dns/utils/nip-hostname.util';

const VERSION_KEY = 'flui-branding-version';
const ASSET_FILES: Array<{ kind: BrandingAssetKind; fileName: string }> = [
  { kind: 'logo-light', fileName: 'logo-light.png' },
  { kind: 'logo-dark', fileName: 'logo-dark.png' },
  { kind: 'icon-light', fileName: 'icon-light.png' },
  { kind: 'icon-dark', fileName: 'icon-dark.png' },
];

@Injectable()
export class OidcIdentityBranding implements IIdentityBranding {
  private readonly logger = new Logger(OidcIdentityBranding.name);

  constructor(
    private readonly oidcProvider: OidcProviderAdminClient,
    private readonly config: ConfigService,
    @InjectRepository(ClusterEntity)
    private readonly clusterRepo: Repository<ClusterEntity>,
  ) {}

  async ensureBranding(
    force = false,
    overrides?: { pat?: string; hostHeader?: string },
  ): Promise<boolean> {
    const { pat, hostHeader } =
      overrides?.pat && overrides?.hostHeader
        ? { pat: overrides.pat, hostHeader: overrides.hostHeader }
        : await this.connection();
    const dir = this.assetDir();
    const colors = this.colors();

    const present: Array<{
      kind: BrandingAssetKind;
      fileName: string;
      bytes: Buffer;
      contentType: string;
    }> = [];
    for (const a of ASSET_FILES) {
      const full = path.join(dir, a.fileName);
      if (!fs.existsSync(full)) {
        this.logger.warn(`Branding asset missing: ${full} — skipping`);
        continue;
      }
      present.push({
        kind: a.kind,
        fileName: a.fileName,
        bytes: fs.readFileSync(full),
        contentType: 'image/png',
      });
    }

    const version = this.computeVersion(present, colors);

    if (!force) {
      const stored = await this.oidcProvider.getOrgMetadata(
        pat,
        hostHeader,
        VERSION_KEY,
      );
      if (stored && stored === version) {
        this.logger.log(
          `Branding version unchanged (${version}) — skipping upload`,
        );
        return false;
      }
    }

    for (const asset of present) {
      try {
        await this.oidcProvider.uploadBrandingAsset(
          pat,
          hostHeader,
          asset.kind,
          asset.bytes,
          asset.fileName,
          asset.contentType,
        );
        this.logger.log(`Uploaded branding asset: ${asset.kind}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to upload ${asset.kind}: ${message}`);
      }
    }

    try {
      await this.oidcProvider.upsertCustomLabelPolicy(pat, hostHeader, colors);
      await this.oidcProvider.activateLabelPolicy(pat, hostHeader);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to apply/activate label policy: ${message}`);
    }

    try {
      await this.oidcProvider.setOrgMetadata(
        pat,
        hostHeader,
        VERSION_KEY,
        version,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to persist branding version: ${message}`);
    }

    this.logger.log(
      `Branding applied: version=${version}, assets=${present.length}/${ASSET_FILES.length}`,
    );
    return true;
  }

  private assetDir(): string {
    return (
      this.config.get<string>('FLUI_BRANDING_ASSET_DIR') ||
      path.resolve(process.cwd(), 'src/assets/branding')
    );
  }

  private colors() {
    return {
      primaryColor:
        this.config.get<string>('FLUI_BRANDING_PRIMARY_COLOR') || '#5B6CFF',
      primaryColorDark:
        this.config.get<string>('FLUI_BRANDING_PRIMARY_COLOR_DARK') ||
        '#7C8BFF',
      backgroundColor:
        this.config.get<string>('FLUI_BRANDING_BG_COLOR') || '#FAFAFA',
      backgroundColorDark:
        this.config.get<string>('FLUI_BRANDING_BG_COLOR_DARK') || '#1F1F22',
      warnColor:
        this.config.get<string>('FLUI_BRANDING_WARN_COLOR') || '#CD3D56',
      fontColor:
        this.config.get<string>('FLUI_BRANDING_FONT_COLOR') || '#1D1D1F',
      hideLoginNameSuffix: false,
      disableWatermark: true,
    };
  }

  private computeVersion(
    assets: Array<{ kind: BrandingAssetKind; bytes: Buffer }>,
    colors: Record<string, unknown>,
  ): string {
    const hash = crypto.createHash('sha256');
    for (const a of assets) {
      hash.update(a.kind);
      hash.update(a.bytes);
    }
    hash.update(JSON.stringify(colors));
    return hash.digest('hex').slice(0, 16);
  }

  private async connection(): Promise<{ pat: string; hostHeader: string }> {
    const pat = process.env.ZITADEL_SERVICE_ACCOUNT_PAT;
    if (!pat) {
      throw new NotImplementedException(
        'OIDC provider PAT not available — bootstrap may not have completed',
      );
    }
    const cluster = await this.clusterRepo.findOne({
      where: {
        clusterType: In([ClusterType.CONTROL, ClusterType.OBSERVABILITY]),
      },
    });
    if (!cluster?.masterIpAddress) {
      throw new InternalServerErrorException(
        'Control cluster master IP unknown — cannot reach OIDC provider',
      );
    }
    return {
      pat,
      hostHeader: buildSystemNipHostname(
        'auth',
        cluster.masterIpAddress,
        cluster.nipHostnameToken,
      ),
    };
  }
}
