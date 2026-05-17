import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityClusterService } from './observability-cluster.service';
import { ObservabilityClusterController } from './observability-cluster.controller';
import { ClusterEntity } from '../clusters/entities/cluster.entity';
import { ClustersModule } from '../clusters/clusters.module';
import { SharedInfrastructureModule } from '../shared/shared-infrastructure.module';
import { GrafanaModule } from 'src/modules/grafana/grafana.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClusterEntity]),
    forwardRef(() => ClustersModule), // Circular dependency with ClustersModule
    SharedInfrastructureModule,
    GrafanaModule, // For GrafanaDatasourceService (avoids circular dependencies)
  ],
  controllers: [ObservabilityClusterController],
  providers: [ObservabilityClusterService],
  exports: [ObservabilityClusterService],
})
export class ObservabilityClusterModule {}
