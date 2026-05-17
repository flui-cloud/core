import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PricingQueryDto as ProviderPricingQueryDto } from 'src/modules/providers/dto/pricing.dto';

// Re-export with Swagger decorators and validation for API documentation
export class PricingQueryDto implements ProviderPricingQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by region/location',
    example: 'nbg1',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Filter by node size/server type',
    example: 'cx11',
  })
  @IsOptional()
  @IsString()
  nodeSize?: string;
}
