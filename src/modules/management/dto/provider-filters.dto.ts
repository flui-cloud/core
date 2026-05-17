import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderStatus } from '../entities/provider-status.enum';
import { Transform } from 'class-transformer';

export class ProviderFiltersDto {
  @ApiPropertyOptional({
    enum: CloudProvider,
    description: 'Filter by provider',
  })
  @IsOptional()
  @IsEnum(CloudProvider)
  provider?: CloudProvider;

  @ApiPropertyOptional({
    enum: ProviderStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
