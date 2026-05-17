import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnsZoneEntity } from '../entities/dns-zone.entity';
import { DnsProviderFactory } from '../../providers/services/dns-provider.factory';

@Injectable()
export class ClusterDnsCleanupService {
  private readonly logger = new Logger(ClusterDnsCleanupService.name);

  constructor(
    @InjectRepository(DnsZoneEntity)
    private readonly dnsZoneRepository: Repository<DnsZoneEntity>,
    private readonly dnsProviderFactory: DnsProviderFactory,
  ) {}

  async deleteRecordsByClusterId(clusterId: string): Promise<number> {
    const zones = await this.dnsZoneRepository.find();
    let deleted = 0;
    for (const zone of zones) {
      deleted += await this.deleteRecordsInZone(zone, clusterId);
    }
    if (deleted > 0) {
      this.logger.log(
        `Removed ${deleted} DNS record(s) tagged with flui-cluster-id=${clusterId}`,
      );
    }
    return deleted;
  }

  private async deleteRecordsInZone(
    zone: DnsZoneEntity,
    clusterId: string,
  ): Promise<number> {
    const provider = this.dnsProviderFactory.getDnsProvider(zone.dnsProvider);
    if (!provider) return 0;

    let records;
    try {
      records = await provider.listRecords(zone.providerZoneId);
    } catch (err) {
      this.logger.warn(
        `Failed to list DNS records on zone ${zone.zoneName}: ${this.errMessage(err)}`,
      );
      return 0;
    }

    const matching = records.filter((r) => {
      const labels = r.labels ?? {};
      return (
        labels['flui-cluster-id'] === clusterId &&
        labels['managed-by'] === 'flui-cloud'
      );
    });

    let deleted = 0;
    for (const record of matching) {
      try {
        await provider.deleteRecord(zone.providerZoneId, record.recordId);
        deleted++;
        this.logger.log(
          `Deleted DNS record ${record.type} ${record.name} -> ${record.value} from zone ${zone.zoneName} (cluster ${clusterId})`,
        );
      } catch (err) {
        this.logger.warn(
          `Failed to delete DNS record ${record.recordId} from zone ${zone.zoneName}: ${this.errMessage(err)}`,
        );
      }
    }
    return deleted;
  }

  private errMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
