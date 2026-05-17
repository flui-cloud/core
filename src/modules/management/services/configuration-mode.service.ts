import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ConfigurationMode = 'hosted' | 'self-hosted';

export interface ConfigurationCapabilities {
  mode: ConfigurationMode;
  features: {
    providerManagement: boolean;
    credentialStorage: boolean;
    multiProvider: boolean;
    costOptimization: boolean;
    support: 'community' | 'email' | 'priority';
  };
}

@Injectable()
export class ConfigurationModeService {
  constructor(private readonly configService: ConfigService) {}

  getCurrentMode(): ConfigurationMode {
    return this.configService.get<ConfigurationMode>(
      'CONFIGURATION_MODE',
      'self-hosted',
    );
  }

  getCapabilities(): ConfigurationCapabilities {
    const mode = this.getCurrentMode();

    return {
      mode,
      features:
        mode === 'hosted'
          ? {
              providerManagement: false,
              credentialStorage: false,
              multiProvider: true,
              costOptimization: true,
              support: 'priority',
            }
          : {
              providerManagement: true,
              credentialStorage: true,
              multiProvider: true,
              costOptimization: false,
              support: 'community',
            },
    };
  }

  isHostedMode(): boolean {
    return this.getCurrentMode() === 'hosted';
  }

  isSelfHostedMode(): boolean {
    return this.getCurrentMode() === 'self-hosted';
  }
}
