import { Injectable } from '@nestjs/common';
import {
  NodeSizeDto,
  NodeSizePriceDto,
  NodeSizeLocationDto,
} from '../dto/node-size.dto';
import {
  ListServerTypes200ResponseServerTypesInner,
  ListServerTypes200ResponseServerTypesInnerLocationsInner,
} from 'src/modules/providers/implementations/hetzner/generated';

@Injectable()
export class NodeSizeMapper {
  /**
   * Maps Hetzner ServerType to NodeSizeDto
   */
  mapHetznerServerTypeToDto(
    serverType: ListServerTypes200ResponseServerTypesInner,
  ): NodeSizeDto {
    return {
      id: serverType.id.toString(),
      name: serverType.name,
      description: serverType.description,
      cores: serverType.cores,
      memory: serverType.memory,
      disk: serverType.disk,
      storageType: serverType.storage_type as 'local' | 'network',
      cpuType: serverType.cpu_type as 'shared' | 'dedicated',
      architecture: serverType.architecture as 'x86' | 'arm',
      deprecated: serverType.deprecated,
      bareMetal: false,
      managedFirewall: true,
      supportsHourlyBilling: true,
      prices: serverType.prices.map((price) => this.mapPrice(price)),
      locations:
        serverType.locations?.map((loc) => this.mapLocation(loc)) || [],
    };
  }

  /**
   * Maps Hetzner price data to NodeSizePriceDto
   */
  private mapPrice(price: any): NodeSizePriceDto {
    return {
      location: price.location,
      priceHourly: {
        net: price.price_hourly.net,
        gross: price.price_hourly.gross,
      },
      priceMonthly: {
        net: price.price_monthly.net,
        gross: price.price_monthly.gross,
      },
    };
  }

  /**
   * Maps Hetzner location data to NodeSizeLocationDto
   */
  private mapLocation(
    location: ListServerTypes200ResponseServerTypesInnerLocationsInner,
  ): NodeSizeLocationDto {
    return {
      id: location.id,
      name: location.name,
      deprecation: location.deprecation
        ? {
            unavailable_after: location.deprecation.unavailable_after,
            announced: location.deprecation.announced,
          }
        : null,
    };
  }

  /**
   * Maps multiple Hetzner ServerTypes to DTOs
   */
  mapHetznerServerTypesToDtos(
    serverTypes: ListServerTypes200ResponseServerTypesInner[],
  ): NodeSizeDto[] {
    return serverTypes.map((st) => this.mapHetznerServerTypeToDto(st));
  }
}
