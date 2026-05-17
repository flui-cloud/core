import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTokenEntity } from '../entities/api-token.entity';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { CredentialType } from '../../management/entities/credentials.entity';
import { CredentialPurpose } from '../enums/credential-purpose.enum';

@Injectable()
export class ApiTokenRepository {
  constructor(
    @InjectRepository(ApiTokenEntity)
    private readonly apiTokenRepo: Repository<ApiTokenEntity>,
  ) {}

  async createToken(
    provider: CloudProvider,
    label: string,
    notes: string | null,
    encryptedToken: string,
    options?: {
      credentialType?: CredentialType;
      encryptedAccessKey?: string;
      expiresAt?: Date;
      purpose?: CredentialPurpose;
    },
  ): Promise<ApiTokenEntity> {
    const token = this.apiTokenRepo.create({
      provider,
      label,
      notes,
      encrypted_token: encryptedToken,
      credential_type: options?.credentialType ?? CredentialType.API_KEY,
      encrypted_access_key: options?.encryptedAccessKey ?? null,
      expires_at: options?.expiresAt ?? null,
      purpose: options?.purpose ?? CredentialPurpose.COMPUTE,
    });

    return this.apiTokenRepo.save(token);
  }

  async findAll(): Promise<ApiTokenEntity[]> {
    return this.apiTokenRepo.find({
      where: { is_active: true },
    });
  }

  async findById(id: string): Promise<ApiTokenEntity | null> {
    return this.apiTokenRepo.findOneBy({ id, is_active: true });
  }

  async updateLastUsed(id: string): Promise<void> {
    const token = await this.findById(id);
    if (!token) {
      throw new Error(`API token with ID ${id} not found`);
    }

    token.last_used_at = new Date();
    await this.apiTokenRepo.save(token);
  }

  async getEncryptedToken(id: string): Promise<string> {
    const token = await this.findById(id);
    if (!token) {
      throw new Error(`API token with ID ${id} not found`);
    }

    token.last_used_at = new Date();
    await this.apiTokenRepo.save(token);

    return token.encrypted_token;
  }

  async getEncryptedAccessKey(id: string): Promise<string | null> {
    const token = await this.findById(id);
    if (!token) {
      throw new Error(`API token with ID ${id} not found`);
    }
    return token.encrypted_access_key ?? null;
  }

  async updateExpiry(id: string, expiresAt: Date | null): Promise<void> {
    const result = await this.apiTokenRepo.update(
      { id, is_active: true },
      { expires_at: expiresAt },
    );

    if (result.affected === 0) {
      throw new Error(`API token with ID ${id} not found`);
    }
  }

  async deleteToken(id: string): Promise<void> {
    const result = await this.apiTokenRepo.delete({ id, is_active: true });

    if (result.affected === 0) {
      throw new Error(`API token with ID ${id} not found`);
    }
  }

  async findByProvider(provider: CloudProvider): Promise<ApiTokenEntity[]> {
    return this.apiTokenRepo.find({
      where: { provider, is_active: true },
    });
  }

  async findByProviderAndPurpose(
    provider: CloudProvider,
    purpose: CredentialPurpose,
  ): Promise<ApiTokenEntity[]> {
    return this.apiTokenRepo.find({
      where: { provider, is_active: true, purpose },
    });
  }
}
