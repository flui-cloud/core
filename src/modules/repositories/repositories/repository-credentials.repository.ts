import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryCredentialEntity } from '../entities/repository-credential.entity';
import { GitProvider } from '../entities/repository.entity';

@Injectable()
export class RepositoryCredentialsRepository {
  constructor(
    @InjectRepository(RepositoryCredentialEntity)
    private readonly repository: Repository<RepositoryCredentialEntity>,
  ) {}

  async create(
    data: Partial<RepositoryCredentialEntity>,
  ): Promise<RepositoryCredentialEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<RepositoryCredentialEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserIdAndProvider(
    userId: string,
    provider: GitProvider,
  ): Promise<RepositoryCredentialEntity | null> {
    return this.repository.findOne({
      where: { userId, provider, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUserId(
    userId: string,
  ): Promise<RepositoryCredentialEntity[]> {
    return this.repository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    data: Partial<RepositoryCredentialEntity>,
  ): Promise<RepositoryCredentialEntity> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async revoke(id: string): Promise<void> {
    await this.repository.update(id, {
      isActive: false,
      revokedAt: new Date(),
    });
  }

  async revokeAllByProvider(
    userId: string,
    provider: GitProvider,
  ): Promise<void> {
    await this.repository.update(
      { userId, provider, isActive: true },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
