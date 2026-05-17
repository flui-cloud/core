import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OidcBootstrapService } from '../services/oidc-bootstrap.service';

export const OIDC_BOOTSTRAP_QUEUE = 'oidc-bootstrap';
export const OIDC_BOOTSTRAP_JOB = 'bootstrap';

@Processor(OIDC_BOOTSTRAP_QUEUE)
export class OidcBootstrapProcessor {
  private readonly logger = new Logger(OidcBootstrapProcessor.name);

  constructor(private readonly bootstrapService: OidcBootstrapService) {}

  @Process({ name: OIDC_BOOTSTRAP_JOB, concurrency: 1 })
  async handleBootstrap(job: Job): Promise<void> {
    this.logger.log(
      `Running OIDC bootstrap (attempt ${job.attemptsMade + 1}/${job.opts.attempts ?? 1})`,
    );
    await this.bootstrapService.bootstrap();
  }
}
