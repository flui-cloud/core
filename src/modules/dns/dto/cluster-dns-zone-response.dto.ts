import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import { ReconciliationStatus } from '../../infrastructure/shared/enums/reconciliation-status.enum';
import { DnsZoneResponseDto } from './dns-zone-response.dto';

export class ClusterDnsZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clusterId: string;

  @ApiProperty()
  dnsZoneId: string;

  @ApiProperty({ type: () => DnsZoneResponseDto })
  dnsZone: DnsZoneResponseDto;

  @ApiPropertyOptional({ enum: CertificateProvider })
  certificateProvider: CertificateProvider;

  @ApiPropertyOptional()
  acmeEmail: string;

  @ApiProperty()
  wildcardCertificate: boolean;

  @ApiProperty({ enum: ReconciliationStatus })
  reconciliationStatus: ReconciliationStatus;

  @ApiPropertyOptional()
  lastReconciliationAt: Date;

  @ApiPropertyOptional()
  errorMessage: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
