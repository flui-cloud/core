import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupPolicyEntity } from '../entities/backup-policy.entity';
import { BackupPolicyDestinationEntity } from '../entities/backup-policy-destination.entity';

@Injectable()
export class BackupPolicyRepository {
  constructor(
    @InjectRepository(BackupPolicyEntity)
    private readonly policyRepo: Repository<BackupPolicyEntity>,
    @InjectRepository(BackupPolicyDestinationEntity)
    private readonly pdRepo: Repository<BackupPolicyDestinationEntity>,
  ) {}

  create(data: Partial<BackupPolicyEntity>): BackupPolicyEntity {
    return this.policyRepo.create(data);
  }

  save(entity: BackupPolicyEntity): Promise<BackupPolicyEntity> {
    return this.policyRepo.save(entity);
  }

  findById(id: string): Promise<BackupPolicyEntity | null> {
    return this.policyRepo.findOne({
      where: { id },
      relations: ['destinations'],
    });
  }

  findByUser(userId: string): Promise<BackupPolicyEntity[]> {
    return this.policyRepo.find({
      where: { userId },
      relations: ['destinations'],
    });
  }

  findByCluster(clusterId: string): Promise<BackupPolicyEntity[]> {
    return this.policyRepo.find({
      where: { clusterId },
      relations: ['destinations'],
    });
  }

  update(id: string, patch: Partial<BackupPolicyEntity>): Promise<unknown> {
    return this.policyRepo.update(id, patch);
  }

  delete(id: string): Promise<unknown> {
    return this.policyRepo.delete(id);
  }

  saveDestinations(
    rows: BackupPolicyDestinationEntity[],
  ): Promise<BackupPolicyDestinationEntity[]> {
    return this.pdRepo.save(rows);
  }

  removeDestinations(policyId: string): Promise<unknown> {
    return this.pdRepo.delete({ policyId });
  }
}
