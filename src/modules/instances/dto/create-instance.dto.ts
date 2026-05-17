import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { InstanceType } from '../entities/instance-type.enum';

class IpConfigDto {
  @ApiPropertyOptional({ description: 'IPv4 configuration' })
  @IsOptional()
  @IsObject()
  v4?: {
    ip?: string;
    gateway?: string;
    netmaskCidr?: number;
  };

  @ApiPropertyOptional({ description: 'IPv6 configuration' })
  @IsOptional()
  @IsObject()
  v6?: {
    ip?: string;
    gateway?: string;
    netmaskCidr?: number;
  };
}

export class CreateInstanceDto {
  @ApiProperty({ description: 'Instance name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Display name (friendly name)' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ enum: InstanceType, description: 'Type of instance' })
  @IsEnum(InstanceType)
  type: InstanceType;

  @ApiProperty({ enum: CloudProvider, description: 'Cloud provider' })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({ description: 'Data center location' })
  @IsNotEmpty()
  @IsString()
  dataCenter: string;

  @ApiProperty({ description: 'Region code' })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiPropertyOptional({ description: 'Region name' })
  @IsOptional()
  @IsString()
  regionName?: string;

  @ApiProperty({ description: 'Number of CPU cores', minimum: 1 })
  @IsNumber()
  @Min(1)
  cpuCores: number;

  @ApiProperty({ description: 'RAM in megabytes', minimum: 512 })
  @IsNumber()
  @Min(512)
  ramMb: number;

  @ApiProperty({ description: 'Disk size in megabytes', minimum: 10240 })
  @IsNumber()
  @Min(10240)
  diskMb: number;

  @ApiPropertyOptional({ description: 'Operating system type' })
  @IsOptional()
  @IsString()
  osType?: string;

  @ApiPropertyOptional({ description: 'IP configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => IpConfigDto)
  ipConfig?: IpConfigDto;

  @ApiPropertyOptional({ description: 'Product type (e.g., ssd, hdd, nvme)' })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'Additional IPs' })
  @IsOptional()
  additionalIps?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
