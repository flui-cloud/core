import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClusterEntity } from '../infrastructure/clusters/entities/cluster.entity';
import { GrafanaConfigService } from './services/grafana-config.service';
import { GrafanaDatasourceService } from './services/grafana-datasource.service';

/**
 * GrafanaModule
 *
 * Dedicated module for Grafana integration without circular dependencies.
 * This module provides services for managing Grafana datasources and configuration.
 *
 * Purpose:
 * - Break circular dependency between ClustersModule and ObservabilityModule
 * - Provide centralized Grafana configuration management
 * - Manage Grafana datasources lifecycle (add/remove on cluster create/delete)
 *
 * Architecture:
 * - GrafanaConfigService: Retrieves Grafana credentials from observability cluster
 * - GrafanaDatasourceService: Manages datasources via Grafana HTTP API
 *
 * Dependencies:
 * - TypeORM (ClusterEntity): Direct database access to query observability cluster
 * - No dependency on ClustersModule or ObservabilityModule (breaks circular dependency)
 *
 * Used by:
 * - ClustersModule: For automatic datasource registration on cluster create/delete
 * - ObservabilityModule: For Grafana-related operations (if needed)
 */
@Module({
  imports: [
    // Import ClusterEntity for direct database queries
    // This avoids circular dependency with ClustersModule
    TypeOrmModule.forFeature([ClusterEntity]),
  ],
  providers: [GrafanaConfigService, GrafanaDatasourceService],
  exports: [
    GrafanaDatasourceService, // Export for use in ClustersModule
    GrafanaConfigService, // Export for use in other modules if needed
  ],
})
export class GrafanaModule {}
