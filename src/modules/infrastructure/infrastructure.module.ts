import { Module } from '@nestjs/common';
import { ServersModule } from './servers/servers.module';
import { ClustersModule } from './clusters/clusters.module';
import { InfrastructureOperationsModule } from './operations/infrastructure-operations.module';
import { ObservabilityClusterModule } from './observability-cluster/observability-cluster.module';
import { VNetsModule } from './vnets/vnets.module';
import { PlatformComponentsModule } from './platform-components/platform-components.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    InfrastructureOperationsModule,
    ServersModule,
    ClustersModule,
    ObservabilityClusterModule,
    VNetsModule,
    PlatformComponentsModule,
    // FirewallsModule (future)
  ],
  exports: [
    InfrastructureOperationsModule,
    ServersModule,
    ClustersModule,
    ObservabilityClusterModule,
    VNetsModule,
    PlatformComponentsModule,
  ],
})
export class InfrastructureModule {}
