import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { StartupHealthCheckService } from './startup-health-check.service';
import { HealthController } from './health.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClusterEntity]), ConfigModule],
  controllers: [HealthController],
  providers: [StartupHealthCheckService],
  exports: [StartupHealthCheckService],
})
export class HealthModule {}
