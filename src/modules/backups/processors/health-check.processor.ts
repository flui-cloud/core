import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BackupDestinationsService } from '../services/backup-destinations.service';
import { BACKUP_QUEUE, BACKUP_JOB_TYPES } from '../backups.constants';

@Processor(BACKUP_QUEUE)
export class HealthCheckProcessor {
  private readonly logger = new Logger(HealthCheckProcessor.name);

  constructor(private readonly destinations: BackupDestinationsService) {}

  @Process(BACKUP_JOB_TYPES.HEALTH_CHECK_DESTINATION)
  async handle(job: Job<{ destinationId: string }>): Promise<void> {
    const { destinationId } = job.data;
    this.logger.debug(`[health-check] destinationId=${destinationId}`);
    try {
      await this.destinations.testConnection(destinationId);
      await this.destinations.refreshUsage(destinationId);
    } catch (err: any) {
      this.logger.warn(`[health-check] Failed: ${err?.message}`);
    }
  }
}
