// src/modules/management/management.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Entities
import { ProviderConfigurationEntity } from './entities/provider-configuration.entity';

// Controllers
import { ManagementController } from './controllers/management.controller';

// Services
import { ManagementService } from './services/management.service';
import { ProviderDefinitionsService } from './services/provider-definitions.service';
import { ConfigurationModeService } from './services/configuration-mode.service';

// Repositories
import { ProviderConfigurationRepository } from './repositories/provider-configuration.repository';

// Import Access Module for credential management
import { AccessModule } from '../access/access.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    AccessModule,
    ProvidersModule,
    TypeOrmModule.forFeature([ProviderConfigurationEntity]),
  ],
  controllers: [ManagementController],
  providers: [
    ManagementService,
    ProviderDefinitionsService,
    ConfigurationModeService,
    ProviderConfigurationRepository,
  ],
  exports: [
    ManagementService,
    ProviderDefinitionsService,
    ConfigurationModeService,
  ],
})
export class ManagementModule {}
