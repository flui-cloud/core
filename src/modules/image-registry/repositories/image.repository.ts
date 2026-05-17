import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageEntity } from '../entities/image.entity';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly repo: Repository<ImageEntity>,
  ) {}

  async findById(id: string): Promise<ImageEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByAppId(appId: string): Promise<ImageEntity[]> {
    return this.repo.find({
      where: { appId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(filters?: {
    appId?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<ImageEntity[]> {
    const qb = this.repo.createQueryBuilder('image');

    if (filters?.appId) {
      qb.andWhere('image.appId = :appId', { appId: filters.appId });
    }

    if (filters?.tag) {
      qb.andWhere('image.fluiTags ::jsonb @> :tag', {
        tag: JSON.stringify([filters.tag]),
      });
    }

    qb.orderBy('image.createdAt', 'DESC');

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }

  async save(entity: Partial<ImageEntity>): Promise<ImageEntity> {
    return this.repo.save(entity as ImageEntity);
  }

  async update(id: string, data: Partial<ImageEntity>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByImageRef(imageRef: string): Promise<ImageEntity | null> {
    return this.repo.findOne({ where: { imageRef } });
  }

  async clearCurrentlyDeployed(appId: string): Promise<void> {
    await this.repo.update(
      { appId, isCurrentlyDeployed: true },
      { isCurrentlyDeployed: false },
    );
  }
}
