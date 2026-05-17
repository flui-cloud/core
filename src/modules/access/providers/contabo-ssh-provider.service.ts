import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISSHProvider } from './interfaces/ssh-provider.interface';
import { SSHKeyDto } from '../dto/ssh-key.dto';

@Injectable()
export class ContaboSSHProviderService implements ISSHProvider {
  private readonly logger = new Logger(ContaboSSHProviderService.name);

  constructor(private readonly configService: ConfigService) {}

  async listSSHKeys(): Promise<SSHKeyDto[]> {
    try {
      this.logger.warn('Contabo SSH key listing not yet implemented');
      return [];

      // Future implementation when Contabo supports SSH keys API
    } catch (error) {
      this.logger.error('Failed to list SSH keys from Contabo API', error);
      return [];
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
