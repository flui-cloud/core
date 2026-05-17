import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClusterEntity } from '../infrastructure/clusters/entities/cluster.entity';
import { ClusterNodeEntity } from '../infrastructure/clusters/entities/cluster-node.entity';
import { SharedInfrastructureModule } from '../infrastructure/shared/shared-infrastructure.module';
import { EncryptionModule } from '../shared/encryption/encryption.module';
import { TopologyController } from './controllers/topology.controller';
import { TopologyService } from './services/topology.service';
import { TopologyEventsService } from './services/topology-events.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ClusterEntity, ClusterNodeEntity]),
    SharedInfrastructureModule,
    EncryptionModule,
  ],
  controllers: [TopologyController],
  providers: [TopologyService, TopologyEventsService],
  exports: [TopologyService, TopologyEventsService],
})
export class TopologyModule {}
