import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClusterEntity } from '../infrastructure/clusters/entities/cluster.entity';
import { ClusterNodeEntity } from '../infrastructure/clusters/entities/cluster-node.entity';
import { ApplicationEntity } from '../applications/entities/application.entity';
import { ManagementModule } from '../management/management.module';
import { VisualizationsController } from './controllers/visualizations.controller';
import { VisualizationsService } from './services/visualizations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClusterEntity,
      ClusterNodeEntity,
      ApplicationEntity,
    ]),
    ManagementModule,
  ],
  controllers: [VisualizationsController],
  providers: [VisualizationsService],
})
export class VisualizationsModule {}
