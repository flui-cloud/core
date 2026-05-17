import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DnsProvider } from '../../providers/enums/dns-provider.enum';

export class CreateDnsZoneDto {
  @ApiPropertyOptional({
    description: 'Zone ID in the DNS provider (if already known)',
  })
  @IsOptional()
  @IsString()
  providerZoneId?: string;

  @ApiProperty({
    example: 'flui.cloud',
    description: 'Root domain name of the zone',
  })
  @IsString()
  zoneName: string;

  @ApiProperty({ enum: DnsProvider, description: 'DNS provider for this zone' })
  @IsEnum(DnsProvider)
  dnsProvider: DnsProvider;

  @ApiPropertyOptional({ description: 'Optional human-readable description' })
  @IsOptional()
  @IsString()
  description?: string;
}
