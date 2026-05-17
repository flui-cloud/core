import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DnsProvider } from '../../providers/enums/dns-provider.enum';

export class DnsZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  providerZoneId: string;

  @ApiProperty()
  zoneName: string;

  @ApiProperty({ enum: DnsProvider })
  dnsProvider: DnsProvider;

  @ApiPropertyOptional()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
