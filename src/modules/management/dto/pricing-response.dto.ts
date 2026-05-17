import { ApiProperty } from '@nestjs/swagger';
import {
  PricingDto,
  ServerTypePricingDto as ProviderServerTypePricingDto,
  LocationPriceDto as ProviderLocationPriceDto,
  PriceDetailDto as ProviderPriceDetailDto,
} from 'src/modules/providers/dto/pricing.dto';

// Re-export with Swagger decorators for API documentation
export class PriceDetailDto implements ProviderPriceDetailDto {
  @ApiProperty({ description: 'Price without VAT', example: '5.00' })
  net: string;

  @ApiProperty({ description: 'Price with VAT', example: '5.95' })
  gross: string;
}

export class LocationPriceDto implements ProviderLocationPriceDto {
  @ApiProperty({ description: 'Location identifier', example: 'nbg1' })
  location: string;

  @ApiProperty({ type: PriceDetailDto })
  priceHourly: PriceDetailDto;

  @ApiProperty({ type: PriceDetailDto })
  priceMonthly: PriceDetailDto;
}

export class ServerTypePricingDto implements ProviderServerTypePricingDto {
  @ApiProperty({ description: 'Server type ID', example: '1' })
  id: string;

  @ApiProperty({ description: 'Server type name', example: 'cx11' })
  name: string;

  @ApiProperty({
    description: 'Prices per location',
    type: [LocationPriceDto],
  })
  prices: LocationPriceDto[];
}

export class PricingResponseDto implements PricingDto {
  @ApiProperty({ description: 'Provider name', example: 'hetzner' })
  provider: string;

  @ApiProperty({ description: 'Currency code (ISO 4217)', example: 'EUR' })
  currency: string;

  @ApiProperty({ description: 'VAT rate as string', example: '0.19' })
  vatRate: string;

  @ApiProperty({
    description: 'Server type pricing information',
    type: [ServerTypePricingDto],
  })
  serverTypes: ServerTypePricingDto[];
}
