import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestoreJobEntity } from '../entities/restore-job.entity';

@Injectable()
export class RestoreJobRepository {
  constructor(
    @InjectRepository(RestoreJobEntity)
    private readonly repo: Repository<RestoreJobEntity>,
  ) {}

  create(data: Partial<RestoreJobEntity>): RestoreJobEntity {
    return this.repo.create(data);
  }

  save(entity: RestoreJobEntity): Promise<RestoreJobEntity> {
    return this.repo.save(entity);
  }

  findById(id: string): Promise<RestoreJobEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  update(id: string, patch: Partial<RestoreJobEntity>): Promise<unknown> {
    return this.repo.update(id, patch);
  }

  findByUser(userId: string): Promise<RestoreJobEntity[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
