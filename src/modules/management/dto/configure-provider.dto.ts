import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsArray,
  IsString,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderCredentialsDto } from './credentials.dto';

export class ConfigureProviderDto {
  @ApiProperty({
    enum: CloudProvider,
    description: 'Cloud provider to configure',
  })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({
    description: 'Provider credentials',
    type: ProviderCredentialsDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ProviderCredentialsDto)
  credentials: ProviderCredentialsDto;

  @ApiProperty({ description: 'Regions to enable', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  enabledRegions: string[];

  @ApiPropertyOptional({ description: 'Additional configuration' })
  @IsOptional()
  @IsObject()
  additionalConfig?: Record<string, any>;
}
