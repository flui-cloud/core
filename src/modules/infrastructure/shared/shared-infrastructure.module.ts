import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../common/common.module';
import { KubernetesService } from './services/kubernetes.service';
import { LabelService } from './services/label.service';

@Module({
  imports: [ConfigModule, CommonModule],
  providers: [KubernetesService, LabelService],
  exports: [CommonModule, KubernetesService, LabelService],
})
export class SharedInfrastructureModule {}
