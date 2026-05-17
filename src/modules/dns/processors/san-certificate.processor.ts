import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  SAN_CERTIFICATE_QUEUE,
  SAN_CERTIFICATE_RECONCILE_JOB,
  SanCertificateReconcileJobData,
  SanCertificateService,
} from '../services/san-certificate.service';

@Processor(SAN_CERTIFICATE_QUEUE)
export class SanCertificateProcessor {
  private readonly logger = new Logger(SanCertificateProcessor.name);

  constructor(private readonly service: SanCertificateService) {}

  @Process({ name: SAN_CERTIFICATE_RECONCILE_JOB, concurrency: 2 })
  async handleReconcile(
    job: Job<SanCertificateReconcileJobData>,
  ): Promise<void> {
    const { sanCertificateId } = job.data;
    this.logger.log(`Reconciling SAN certificate ${sanCertificateId}`);
    await this.service.reconcile(sanCertificateId);
  }
}
