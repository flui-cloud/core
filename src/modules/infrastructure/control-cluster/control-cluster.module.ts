import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlClusterService } from './control-cluster.service';
import { ControlClusterController } from './control-cluster.controller';
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
  controllers: [ControlClusterController],
  providers: [ControlClusterService],
  exports: [ControlClusterService],
})
export class ControlClusterModule {}
