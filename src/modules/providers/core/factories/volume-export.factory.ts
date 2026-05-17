import {
  Injectable,
  Inject,
  Optional,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { IVolumeExport } from '../../interfaces/volume-export.interface';
import { VOLUME_EXPORT_REGISTRY, VolumeExportRegistration } from '../tokens';

@Injectable()
export class VolumeExportFactory {
  private readonly logger = new Logger(VolumeExportFactory.name);
  private readonly registry = new Map<CloudProvider, IVolumeExport>();

  constructor(
    @Optional()
    @Inject(VOLUME_EXPORT_REGISTRY)
    registrations: VolumeExportRegistration | VolumeExportRegistration[] | null,
  ) {
    let list: VolumeExportRegistration[] = [];
    if (Array.isArray(registrations)) list = registrations;
    else if (registrations) list = [registrations];
    for (const reg of list) {
      this.registry.set(reg.provider, reg.service);
    }
  }

  get(provider: CloudProvider): IVolumeExport | null {
    return this.registry.get(provider) ?? null;
  }

  getOrFail(provider: CloudProvider): IVolumeExport {
    const service = this.registry.get(provider);
    if (!service) {
      throw new BadRequestException(
        `Volume export is not supported for provider: ${provider}. ` +
          `Supported providers: ${this.getSupportedProviders().join(', ') || '(none)'}`,
      );
    }
    return service;
  }

  supports(provider: CloudProvider): boolean {
    return this.registry.has(provider);
  }

  getSupportedProviders(): CloudProvider[] {
    return Array.from(this.registry.keys());
  }
}
