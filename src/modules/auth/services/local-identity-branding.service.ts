import { Injectable, Logger } from '@nestjs/common';
import { IIdentityBranding } from '../interfaces/identity-branding.interface';

@Injectable()
export class LocalIdentityBranding implements IIdentityBranding {
  private readonly logger = new Logger(LocalIdentityBranding.name);

  async ensureBranding(
    _force?: boolean,
    _overrides?: { pat?: string; hostHeader?: string },
  ): Promise<boolean> {
    this.logger.debug(
      'Skipping identity-provider branding — AUTH_MODE=local has no hosted login UI',
    );
    return false;
  }
}
