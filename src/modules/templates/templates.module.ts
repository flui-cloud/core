import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RepositoriesModule } from '../repositories/repositories.module';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [ConfigModule, RepositoriesModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
