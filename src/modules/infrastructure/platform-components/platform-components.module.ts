import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClusterEntity } from '../clusters/entities/cluster.entity';
import { ClusterAuthzInstallEntity } from '../../authz/entities/cluster-authz-install.entity';
import { ClusterAuthzInstallRepository } from '../../authz/repositories/cluster-authz-install.repository';
import { SharedInfrastructureModule } from '../shared/shared-infrastructure.module';
import { EncryptionModule } from '../../shared/encryption/encryption.module';
import { PlatformComponentsController } from './controllers/platform-components.controller';
import { PlatformComponentsService } from './services/platform-components.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClusterEntity, ClusterAuthzInstallEntity]),
    SharedInfrastructureModule,
    EncryptionModule,
  ],
  controllers: [PlatformComponentsController],
  providers: [PlatformComponentsService, ClusterAuthzInstallRepository],
  exports: [PlatformComponentsService],
})
export class PlatformComponentsModule {}
