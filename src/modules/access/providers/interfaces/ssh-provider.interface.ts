// File: src/modules/access/providers/interfaces/ssh-provider.interface.ts

import { SSHKeyDto } from '../../dto/ssh-key.dto';

export interface ISSHProvider {
  listSSHKeys(): Promise<SSHKeyDto[]>;
  testConnection(): Promise<{ success: boolean; error?: string }>;
}
