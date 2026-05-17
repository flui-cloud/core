import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  IFirewallProvider,
  CreateFirewallConfig,
  FirewallCreationResult,
  FirewallDetails,
  FirewallRule,
  FirewallFilters,
} from '../interfaces/firewall-provider.interface';

@Injectable()
export class ContaboFirewallService implements IFirewallProvider {
  private notImplemented(): never {
    throw new NotImplementedException(
      'Contabo provider: firewall management not yet implemented',
    );
  }

  async createFirewall(
    _config: CreateFirewallConfig,
  ): Promise<FirewallCreationResult> {
    this.notImplemented();
  }

  async getFirewall(_firewallId: string): Promise<FirewallDetails | null> {
    this.notImplemented();
  }

  async listFirewalls(_filters?: FirewallFilters): Promise<FirewallDetails[]> {
    this.notImplemented();
  }

  async updateFirewallRules(
    _firewallId: string,
    _rules: FirewallRule[],
  ): Promise<void> {
    this.notImplemented();
  }

  async deleteFirewall(_firewallId: string): Promise<void> {
    this.notImplemented();
  }

  async applyToServers(
    _firewallId: string,
    _serverIds: string[],
  ): Promise<void> {
    this.notImplemented();
  }

  async removeFromServers(
    _firewallId: string,
    _serverIds: string[],
  ): Promise<void> {
    this.notImplemented();
  }
}
