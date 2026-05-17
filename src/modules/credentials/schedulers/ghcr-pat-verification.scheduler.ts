import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GithubAppUserAuthService } from '../../repositories/services/github-app-user-auth.service';
import { CredentialsStatusService } from '../services/credentials-status.service';

@Injectable()
export class GhcrPatVerificationScheduler {
  private readonly logger = new Logger(GhcrPatVerificationScheduler.name);

  constructor(
    private readonly userAuth: GithubAppUserAuthService,
    private readonly credentialsStatus: CredentialsStatusService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async tick(): Promise<void> {
    const pats = await this.userAuth.listActiveGhcrPats();
    if (pats.length === 0) return;

    this.logger.log(`Verifying ${pats.length} GHCR PAT(s)`);
    for (const pat of pats) {
      try {
        await this.userAuth.verifyStoredPat(pat.userId);
      } catch (err) {
        this.logger.warn(
          `GHCR PAT verification threw for userId=${pat.userId}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
    this.credentialsStatus.invalidate();
  }
}
