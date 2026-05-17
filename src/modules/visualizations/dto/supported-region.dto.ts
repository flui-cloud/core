import { ApiProperty } from '@nestjs/swagger';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';

export class SupportedRegionDto {
  @ApiProperty({ enum: CloudProvider })
  provider: CloudProvider;

  @ApiProperty({ example: 'fsn1' })
  id: string;

  @ApiProperty({ example: 'Falkenstein' })
  name: string;

  @ApiProperty({ example: 'Falkenstein, Germany' })
  displayName: string;

  @ApiProperty({ example: 'Germany', required: false })
  country?: string;

  @ApiProperty({ example: '🇩🇪', required: false })
  flagEmoji?: string;

  @ApiProperty({ example: 50.4777 })
  latitude: number;

  @ApiProperty({ example: 12.3649 })
  longitude: number;
}

export class SupportedRegionsResponseDto {
  @ApiProperty({ type: [SupportedRegionDto] })
  regions: SupportedRegionDto[];

  @ApiProperty({ example: 7 })
  total: number;
}
