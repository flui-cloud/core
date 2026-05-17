import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  ServersService,
  CreateServerJobData,
  DeleteServerJobData,
} from '../services/servers.service';

@Processor('infrastructure')
export class InfrastructureQueueProcessor {
  private readonly logger = new Logger(InfrastructureQueueProcessor.name);

  constructor(private readonly serversService: ServersService) {}

  @Process('create-server')
  async handleCreateServer(job: Job<CreateServerJobData>): Promise<void> {
    this.logger.log(`Processing create server job: ${job.id}`);

    try {
      await job.progress(0);
      await this.serversService.processCreateServer(job.data);
      await job.progress(100);

      this.logger.log(`Create server job completed: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Create server job failed: ${job.id} — ${error.message}`,
      );
      throw error;
    }
  }

  @Process('delete-server')
  async handleDeleteServer(job: Job<DeleteServerJobData>): Promise<void> {
    this.logger.log(`Processing delete server job: ${job.id}`);

    try {
      await job.progress(0);
      await this.serversService.processDeleteServer(job.data);
      await job.progress(100);

      this.logger.log(`Delete server job completed: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Delete server job failed: ${job.id} — ${error.message}`,
      );
      throw error;
    }
  }
}
