import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BackupPolicyRepository } from '../repositories/backup-policy.repository';
import { CreateBackupPolicyDto } from '../dto/create-backup-policy.dto';
import { BackupPolicyEntity } from '../entities/backup-policy.entity';
import { BackupPolicyDestinationEntity } from '../entities/backup-policy-destination.entity';
import {
  BackupPolicyStatus,
  BackupPolicyProfile,
} from '../enums/backup-policy-status.enum';
import { DestinationRole } from '../enums/destination-role.enum';

@Injectable()
export class BackupPoliciesService {
  private readonly logger = new Logger(BackupPoliciesService.name);

  constructor(private readonly repo: BackupPolicyRepository) {}

  async create(
    userId: string,
    dto: CreateBackupPolicyDto,
  ): Promise<BackupPolicyEntity> {
    const primaries = dto.destinations.filter(
      (d) => d.role === DestinationRole.PRIMARY,
    );
    if (primaries.length !== 1) {
      throw new BadRequestException(
        'Exactly one PRIMARY destination is required',
      );
    }

    const policy = this.repo.create({
      userId,
      clusterId: dto.clusterId,
      name: dto.name,
      scope: dto.scope,
      scopeSelector: dto.scopeSelector ?? {},
      includePvcs: dto.includePvcs ?? true,
      includeEtcdL1: dto.includeEtcdL1 ?? false,
      cronSchedule: dto.cronSchedule,
      retentionDays: dto.retentionDays ?? 30,
      retentionMaxCopies: dto.retentionMaxCopies,
      enabled: true,
      status: BackupPolicyStatus.ACTIVE,
      profile: dto.profile ?? this.inferProfile(dto.destinations.length),
    });

    const saved = await this.repo.save(policy);

    const destRows: BackupPolicyDestinationEntity[] = dto.destinations.map(
      (d) =>
        ({
          policyId: saved.id,
          destinationId: d.destinationId,
          role: d.role,
          priority: d.priority ?? 0,
          retentionDaysOverride: d.retentionDaysOverride,
          retentionMaxCopiesOverride: d.retentionMaxCopiesOverride,
          enabled: true,
        }) as BackupPolicyDestinationEntity,
    );
    await this.repo.saveDestinations(destRows);
    return this.findById(saved.id);
  }

  async findById(id: string): Promise<BackupPolicyEntity> {
    const policy = await this.repo.findById(id);
    if (!policy) throw new NotFoundException(`BackupPolicy ${id} not found`);
    return policy;
  }

  async list(userId: string): Promise<BackupPolicyEntity[]> {
    return this.repo.findByUser(userId);
  }

  async listByCluster(clusterId: string): Promise<BackupPolicyEntity[]> {
    return this.repo.findByCluster(clusterId);
  }

  async setStatus(id: string, status: BackupPolicyStatus): Promise<void> {
    await this.repo.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  primaryDestinationOf(
    policy: BackupPolicyEntity,
  ): BackupPolicyDestinationEntity {
    const p = policy.destinations.find(
      (d) => d.role === DestinationRole.PRIMARY,
    );
    if (!p) throw new Error(`Policy ${policy.id} has no PRIMARY destination`);
    return p;
  }

  replicaDestinationsOf(
    policy: BackupPolicyEntity,
  ): BackupPolicyDestinationEntity[] {
    return policy.destinations
      .filter((d) => d.role === DestinationRole.REPLICA && d.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  private inferProfile(n: number): BackupPolicyProfile {
    if (n <= 1) return BackupPolicyProfile.SINGLE;
    if (n === 2) return BackupPolicyProfile.MIRRORED;
    return BackupPolicyProfile.CUSTOM;
  }
}
