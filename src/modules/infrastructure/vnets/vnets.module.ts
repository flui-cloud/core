import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VNetEntity } from './entities/vnet.entity';
import { VNetSubnetEntity } from './entities/vnet-subnet.entity';
import { VNetRouteEntity } from './entities/vnet-route.entity';
import { VNetsController } from './controllers/vnets.controller';
import { SubnetsController } from './controllers/subnets.controller';
import { VNetsService } from './services/vnets.service';
import { SubnetsService } from './services/subnets.service';
import { ProvidersModule } from 'src/modules/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VNetEntity, VNetSubnetEntity, VNetRouteEntity]),
    ProvidersModule,
  ],
  controllers: [VNetsController, SubnetsController],
  providers: [VNetsService, SubnetsService],
  exports: [VNetsService, SubnetsService],
})
export class VNetsModule {}
