import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  OIDC_BOOTSTRAP_QUEUE,
  OIDC_BOOTSTRAP_JOB,
} from '../processors/oidc-bootstrap.processor';
import { OidcBootstrapService } from '../services/oidc-bootstrap.service';

const JOB_ID = 'oidc-bootstrap-singleton';

/**
 * Fallback for setup-zitadel-oidc.sh (run by k3s-master-init.sh): enqueues a
 * one-shot OIDC provider bootstrap if AUTH_MODE=oidc and OIDC_AUDIENCE is
 * still empty when flui-api boots — i.e. the bootstrap script failed or was
 * skipped. When the script succeeded, flui-secrets already carries
 * OIDC_AUDIENCE and this seeder is a no-op.
 */
@Injectable()
export class OidcBootstrapSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(OidcBootstrapSeeder.name);

  constructor(
    @InjectQueue(OIDC_BOOTSTRAP_QUEUE)
    private readonly queue: Queue,
    private readonly oidcBootstrapService: OidcBootstrapService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const authMode = (process.env.AUTH_MODE ?? '').toLowerCase();
    if (authMode !== 'oidc') return;

    // OIDC_AUDIENCE is the client ID of the OIDC app and is empty until the
    // provider app has been created — it is the authoritative marker of
    // "bootstrap done". OIDC_ISSUER is set up-front by the bootstrap manifests,
    // so it cannot be used to detect a fresh cluster.
    const audience = (process.env.OIDC_AUDIENCE ?? '').trim();
    if (audience) {
      this.logger.debug(`OIDC_AUDIENCE already set — skipping OIDC bootstrap`);
      await this.ensureCliApp();
      return;
    }

    try {
      const existing = await this.queue.getJob(JOB_ID);
      if (existing) {
        const state = await existing.getState();
        if (state === 'active' || state === 'waiting' || state === 'delayed') {
          this.logger.log(
            `OIDC bootstrap job already in queue (state=${state})`,
          );
          return;
        }
        await existing.remove();
      }

      await this.queue.add(
        OIDC_BOOTSTRAP_JOB,
        {},
        {
          jobId: JOB_ID,
          attempts: 10,
          backoff: { type: 'exponential', delay: 15_000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      this.logger.log(
        'OIDC bootstrap job enqueued (OIDC mode, issuer not yet configured)',
      );
    } catch (err) {
      this.logger.error(`Failed to enqueue OIDC bootstrap job: ${err.message}`);
    }
  }

  private async ensureCliApp(): Promise<void> {
    const cliClientId = (process.env.OIDC_CLI_CLIENT_ID ?? '').trim();
    if (cliClientId) return;

    this.logger.log(
      'OIDC_CLI_CLIENT_ID missing — provisioning Flui CLI OIDC app...',
    );
    try {
      const result = await this.oidcBootstrapService.provisionCliApp();
      process.env.OIDC_CLI_CLIENT_ID = result.clientId;
      this.logger.log(
        `Flui CLI OIDC app provisioned (clientId=${result.clientId})`,
      );
    } catch (err) {
      this.logger.warn(`Could not provision CLI OIDC app: ${err.message}`);
    }
  }
}
