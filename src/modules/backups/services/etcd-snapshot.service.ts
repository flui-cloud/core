import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { BackupDestinationRepository } from '../repositories/backup-destination.repository';
import { BackupDestinationsService } from './backup-destinations.service';

/**
 * Stub L1 (etcd K3s) integration. Exposes the surface for enabling/triggering
 * etcd snapshots against a Flui BackupDestination.
 *
 * Two modes are intended:
 *   1. New clusters — flags injected at K3s bootstrap (k3s-script.service).
 *      Implementation point: pass `etcdSnapshotConfig` through K3sMasterConfig.
 *   2. Existing clusters — systemd drop-in via SSH (deferred): wires creds into
 *      /etc/systemd/system/k3s.service.d/10-etcd-s3.conf with perms 0600.
 *
 * For MVP this service centralizes the resolution of destination → K3s flags
 * and validates that the destination is etcd-L1 capable.
 */
@Injectable()
export class EtcdSnapshotService {
  private readonly logger = new Logger(EtcdSnapshotService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepo: Repository<ClusterEntity>,
    private readonly destRepo: BackupDestinationRepository,
    private readonly destinationsService: BackupDestinationsService,
  ) {}

  async resolveK3sEtcdFlags(
    clusterId: string,
    destinationId: string,
  ): Promise<Record<string, string>> {
    const dest = await this.destRepo.findById(destinationId);
    if (!dest) throw new Error(`Destination ${destinationId} not found`);
    if (!dest.usableForEtcdL1) {
      throw new Error(
        `Destination ${destinationId} is not flagged usableForEtcdL1`,
      );
    }
    const creds = this.destinationsService.toCredentials(dest);
    return {
      'etcd-s3': 'true',
      'etcd-s3-endpoint': dest.endpoint,
      'etcd-s3-region': dest.region,
      'etcd-s3-bucket': dest.bucket,
      'etcd-s3-folder': `flui/${clusterId}/etcd/`,
      'etcd-snapshot-schedule-cron': '0 */6 * * *',
      'etcd-snapshot-retention': '14',
      'etcd-s3-access-key': creds.accessKey,
      'etcd-s3-secret-key': creds.secretKey,
    };
  }

  /**
   * Render the systemd drop-in body for an existing cluster.
   * Caller is responsible for SSH'ing it onto the master with perm 0600
   * and triggering `systemctl daemon-reload && systemctl restart k3s`.
   */
  async renderSystemdDropin(
    clusterId: string,
    destinationId: string,
  ): Promise<string> {
    const flags = await this.resolveK3sEtcdFlags(clusterId, destinationId);
    const args = Object.entries(flags)
      .map(([k, v]) => `--${k}=${this.shellEscape(v)}`)
      .join(' ');
    return [
      '[Service]',
      `Environment="K3S_ETCD_S3_ARGS=${args}"`,
      `ExecStart=`,
      `ExecStart=/usr/local/bin/k3s server $K3S_ETCD_S3_ARGS`,
      '',
    ].join('\n');
  }

  private shellEscape(v: string): string {
    if (/^[A-Za-z0-9._:/=+-]+$/.test(v)) return v;
    const escaped = v.replaceAll('"', String.raw`\"`);
    return `"${escaped}"`;
  }
}
