import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderCredentialsEntity } from '../entities/credentials.entity';

@Injectable()
export class ProviderCredentialsRepository {
  constructor(
    @InjectRepository(ProviderCredentialsEntity)
    private readonly credentialsRepo: Repository<ProviderCredentialsEntity>,
  ) {}

  async saveCredentials(
    provider: CloudProvider,
    username: string,
    password: string,
    client_id: string,
    client_secret: string,
    accessToken?: string,
    refreshToken?: string,
    expiresIn?: number,
    refreshTokenExp?: number,
  ): Promise<ProviderCredentialsEntity> {
    const credentials = this.credentialsRepo.create({
      provider: provider,
      client_id: client_id,
      client_secret: client_secret,
      username: username,
      password: password,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresIn
        ? new Date(Date.now() + expiresIn * 1000)
        : null,
      isActive: true,
      refresh_token_expires_at: refreshTokenExp
        ? new Date(refreshTokenExp * 1000)
        : null,
    });

    //first check if credentials already exist by provider and username
    const existing = await this.credentialsRepo.findOne({
      where: { provider, username },
    });

    if (existing) {
      credentials.id = existing.id;
    }
    return this.credentialsRepo.save(credentials);
  }

  async findByProvider(
    provider: CloudProvider,
  ): Promise<ProviderCredentialsEntity[]> {
    return this.credentialsRepo.find({
      where: { provider, isActive: true },
    });
  }

  async findById(id: string): Promise<ProviderCredentialsEntity | null> {
    return this.credentialsRepo.findOneBy({ id, isActive: true });
  }

  async findByClientId(
    clientId: string,
    provider: CloudProvider,
  ): Promise<ProviderCredentialsEntity | null> {
    return this.credentialsRepo.findOneBy({
      client_id: clientId,
      provider: provider,
      isActive: true,
    });
  }

  async updateTokens(
    id: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number,
  ): Promise<ProviderCredentialsEntity> {
    const credentials = await this.findById(id);

    if (!credentials) {
      throw new Error('Credentials not found');
    }

    credentials.access_token = accessToken;
    if (refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    if (expiresIn) {
      credentials.token_expires_at = new Date(Date.now() + expiresIn * 1000);
    }

    return this.credentialsRepo.save(credentials);
  }

  async deleteCredentials(id: string): Promise<void> {
    await this.credentialsRepo.update(id, { isActive: false });
  }

  async getActiveCredentials(): Promise<ProviderCredentialsEntity[]> {
    return this.credentialsRepo.find({
      where: { isActive: true },
    });
  }

  async isTokenExpired(id: string): Promise<boolean> {
    const credentials = await this.findById(id);
    if (!credentials?.token_expires_at) {
      return true;
    }

    return credentials.token_expires_at < new Date();
  }

  async findAll() {
    return this.credentialsRepo.find();
  }

  async deleteTokenAndCredentials(id: string) {
    await this.credentialsRepo.delete(id);
  }
}
