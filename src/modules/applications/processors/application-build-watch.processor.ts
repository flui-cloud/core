import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ApplicationBuildWatcherService } from '../services/application-build-watcher.service';

export const BUILD_WATCH_QUEUE = 'application-build-watch';
export const BUILD_WATCH_JOB = 'watch-cycle';

/**
 * Default polling interval for the build watcher. Configurable via the
 * `BUILD_WATCH_INTERVAL_MS` env var. 30s by default — a reasonable tradeoff
 * between latency and GitHub API pressure for a typical workload.
 */
const DEFAULT_INTERVAL_MS = 30_000;

/**
 * Background watcher that polls GitHub Actions for apps in AWAITING_BUILD
 * state. Registers a Bull repeat job at module boot and delegates each tick
 * to {@link ApplicationBuildWatcherService.reconcileAll}.
 *
 * The repeat job uses a stable jobId so restarts do not stack duplicate
 * schedules — Bull replaces the existing one on re-add.
 */
@Processor(BUILD_WATCH_QUEUE)
export class ApplicationBuildWatchProcessor implements OnModuleInit {
  private readonly logger = new Logger(ApplicationBuildWatchProcessor.name);

  constructor(
    @InjectQueue(BUILD_WATCH_QUEUE)
    private readonly queue: Queue,
    private readonly buildWatcher: ApplicationBuildWatcherService,
  ) {}

  async onModuleInit(): Promise<void> {
    const intervalMs = this.resolveIntervalMs();

    // Clear any pre-existing repeat schedules for this job (e.g. from a prior
    // run with a different interval) so we do not accumulate duplicates.
    try {
      const repeatables = await this.queue.getRepeatableJobs();
      for (const r of repeatables) {
        if (r.name === BUILD_WATCH_JOB) {
          await this.queue.removeRepeatableByKey(r.key);
        }
      }
    } catch (err) {
      this.logger.warn(
        `Could not clean up existing repeatable jobs: ${err.message}`,
      );
    }

    await this.queue.add(
      BUILD_WATCH_JOB,
      {},
      {
        repeat: { every: intervalMs },
        jobId: 'build-watch-singleton',
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    this.logger.log(`Build watcher registered with ${intervalMs}ms interval`);
  }

  @Process(BUILD_WATCH_JOB)
  async handleTick(_job: Job): Promise<void> {
    try {
      await this.buildWatcher.reconcileAll();
    } catch (err) {
      this.logger.error(`Build watch cycle failed: ${err.message}`, err.stack);
      // Do not rethrow — we don't want Bull to mark the repeat job failed
      // and back off. A failed tick is non-fatal; the next tick will retry.
    }
  }

  private resolveIntervalMs(): number {
    const raw = process.env.BUILD_WATCH_INTERVAL_MS;
    if (!raw) return DEFAULT_INTERVAL_MS;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1000) {
      this.logger.warn(
        `Invalid BUILD_WATCH_INTERVAL_MS="${raw}", falling back to ${DEFAULT_INTERVAL_MS}`,
      );
      return DEFAULT_INTERVAL_MS;
    }
    return parsed;
  }
}
