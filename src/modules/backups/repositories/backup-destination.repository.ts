import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupDestinationEntity } from '../entities/backup-destination.entity';

@Injectable()
export class BackupDestinationRepository {
  constructor(
    @InjectRepository(BackupDestinationEntity)
    private readonly repo: Repository<BackupDestinationEntity>,
  ) {}

  create(data: Partial<BackupDestinationEntity>): BackupDestinationEntity {
    return this.repo.create(data);
  }

  save(entity: BackupDestinationEntity): Promise<BackupDestinationEntity> {
    return this.repo.save(entity);
  }

  findById(id: string): Promise<BackupDestinationEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUser(userId: string): Promise<BackupDestinationEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  findAll(): Promise<BackupDestinationEntity[]> {
    return this.repo.find();
  }

  update(
    id: string,
    patch: Partial<BackupDestinationEntity>,
  ): Promise<unknown> {
    return this.repo.update(id, patch);
  }

  delete(id: string): Promise<unknown> {
    return this.repo.delete(id);
  }
}
