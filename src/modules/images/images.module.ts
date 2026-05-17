import { Module } from '@nestjs/common';
import { DockerHubService } from './services/dockerhub.service';
import { ResourceProfilesService } from './services/resource-profiles.service';
import { ImagesController } from './controllers/images.controller';

@Module({
  controllers: [ImagesController],
  providers: [DockerHubService, ResourceProfilesService],
  exports: [DockerHubService, ResourceProfilesService],
})
export class ImagesModule {}
