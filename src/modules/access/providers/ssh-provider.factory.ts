import { Injectable } from '@nestjs/common';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderFactory } from '../../providers';
import { ContaboSSHProviderService } from './contabo-ssh-provider.service';
import { HetznerSSHProviderService } from './hetzner-ssh-provider.service';
import { ISSHProvider } from './interfaces/ssh-provider.interface';

@Injectable()
export class SSHProviderFactory {
  constructor(
    private readonly hetznerSSHProvider: HetznerSSHProviderService,
    private readonly contaboSSHProvider: ContaboSSHProviderService,
    private readonly providerFactory: ProviderFactory,
  ) {}

  getProvider(provider: CloudProvider): ISSHProvider | null {
    switch (provider) {
      case CloudProvider.HETZNER:
        return this.hetznerSSHProvider;
      case CloudProvider.CONTABO:
        return this.contaboSSHProvider;
      default:
        return null;
    }
  }

  getAvailableProviders(): CloudProvider[] {
    return this.providerFactory.getSupportedProviders();
  }
}
