import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { GhcrSecretRefreshService } from '../services/ghcr-secret-refresh.service';

export const GHCR_SECRET_REFRESH_QUEUE = 'ghcr-secret-refresh';
export const GHCR_SECRET_REFRESH_JOB = 'refresh-cycle';

/** Default interval: 45 minutes (15-min buffer before 1-hour token expiry). */
const DEFAULT_INTERVAL_MS = 45 * 60 * 1000;

/**
 * Background job that periodically refreshes GHCR imagePullSecrets for all
 * active GIT_BUILD apps. GitHub App installation tokens expire after 1 hour;
 * this job ensures pull secrets stay valid for pod reschedules and autoscaling.
 *
 * Follows the same Bull repeat-job pattern as {@link ApplicationBuildWatchProcessor}.
 */
@Processor(GHCR_SECRET_REFRESH_QUEUE)
export class GhcrSecretRefreshProcessor implements OnModuleInit {
  private readonly logger = new Logger(GhcrSecretRefreshProcessor.name);

  constructor(
    @InjectQueue(GHCR_SECRET_REFRESH_QUEUE)
    private readonly queue: Queue,
    private readonly refreshService: GhcrSecretRefreshService,
  ) {}

  async onModuleInit(): Promise<void> {
    const intervalMs = this.resolveIntervalMs();

    try {
      const repeatables = await this.queue.getRepeatableJobs();
      for (const r of repeatables) {
        if (r.name === GHCR_SECRET_REFRESH_JOB) {
          await this.queue.removeRepeatableByKey(r.key);
        }
      }
    } catch (err) {
      this.logger.warn(
        `Could not clean up existing repeatable jobs: ${err.message}`,
      );
    }

    await this.queue.add(
      GHCR_SECRET_REFRESH_JOB,
      {},
      {
        repeat: { every: intervalMs },
        jobId: 'ghcr-secret-refresh-singleton',
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    this.logger.log(
      `GHCR secret refresh registered with ${intervalMs}ms interval`,
    );
  }

  @Process(GHCR_SECRET_REFRESH_JOB)
  async handleTick(_job: Job): Promise<void> {
    try {
      await this.refreshService.refreshAll();
    } catch (err) {
      this.logger.error(
        `GHCR secret refresh cycle failed: ${err.message}`,
        err.stack,
      );
    }
  }

  private resolveIntervalMs(): number {
    const raw = process.env.GHCR_SECRET_REFRESH_INTERVAL_MS;
    if (!raw) return DEFAULT_INTERVAL_MS;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 60_000) {
      this.logger.warn(
        `Invalid GHCR_SECRET_REFRESH_INTERVAL_MS="${raw}", falling back to ${DEFAULT_INTERVAL_MS}`,
      );
      return DEFAULT_INTERVAL_MS;
    }
    return parsed;
  }
}
