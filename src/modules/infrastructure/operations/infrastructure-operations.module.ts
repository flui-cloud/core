import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureOperationsController } from './infrastructure-operations.controller';
import { InfrastructureOperationsService } from './infrastructure-operations.service';
import { InfrastructureOperationEntity } from '../servers/entities/infrastructure-operations.entity';
import { InfrastructureOperationsGateway } from './gateway/infrastructure-operations.gateway';
import { WsAuthModule } from '../../auth/ws-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InfrastructureOperationEntity]),
    WsAuthModule,
  ],
  controllers: [InfrastructureOperationsController],
  providers: [InfrastructureOperationsService, InfrastructureOperationsGateway],
  exports: [InfrastructureOperationsService, InfrastructureOperationsGateway],
})
export class InfrastructureOperationsModule {}
