import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CliProvidersModule } from './cli-providers.module';
import { CommonModule } from 'src/modules/common/common.module';
import { CliInfrastructureModule } from './modules/cli-infrastructure.module';
import * as path from 'node:path';
import * as os from 'node:os';

const CLI_DATA_DIR = path.join(os.homedir(), '.flui');

/**
 * CLI Module - Standalone Infrastructure Management
 *
 * This module provides CLI commands without requiring external services:
 * - NO PostgreSQL database required
 * - NO Redis queue required
 * - File-based persistence in ~/.flui/
 * - Uses CliInfrastructureModule for cluster management
 * - config:* commands use file-based storage in ~/.flui/config.json
 * - env:* commands use file-based cluster/operation tracking
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(CLI_DATA_DIR, '.env'),
        path.join(process.cwd(), '.env'),
      ],
    }),
    CliProvidersModule,
    CommonModule,
    CliInfrastructureModule,
  ],
})
export class CliModule {}
