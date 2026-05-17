import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { StorageBackendProvider } from '../../storage/enums/storage-backend-provider.enum';
import { EncryptionMode } from '../enums/destination-health.enum';

export class CreateBackupDestinationDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: StorageBackendProvider })
  @IsEnum(StorageBackendProvider)
  provider: StorageBackendProvider;

  @ApiProperty()
  @IsString()
  endpoint: string;

  @ApiProperty()
  @IsString()
  region: string;

  @ApiProperty()
  @IsString()
  bucket: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pathPrefix?: string;

  @ApiProperty()
  @IsString()
  accessKey: string;

  @ApiProperty()
  @IsString()
  secretKey: string;

  @ApiPropertyOptional({ enum: EncryptionMode })
  @IsOptional()
  @IsEnum(EncryptionMode)
  encryptionMode?: EncryptionMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  encryptionPassphrase?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  forcePathStyle?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useSse?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usableForEtcdL1?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  costPerGbMonthCents?: number;
}
