import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { ImageRepository } from './repositories/image.repository';
import { ImageRegistryService } from './services/image-registry.service';
import { ImageRegistryController } from './controllers/image-registry.controller';
import { ApplicationsModule } from '../applications/applications.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { InfrastructureOperationEntity } from '../infrastructure/servers/entities/infrastructure-operations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity, InfrastructureOperationEntity]),
    forwardRef(() => ApplicationsModule),
    RepositoriesModule,
  ],
  controllers: [ImageRegistryController],
  providers: [ImageRepository, ImageRegistryService],
  exports: [ImageRegistryService],
})
export class ImageRegistryModule {}
