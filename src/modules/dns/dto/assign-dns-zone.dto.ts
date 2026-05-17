import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';

export class AssignDnsZoneDto {
  @ApiProperty({
    description: 'ID of the DnsZoneEntity to assign to the cluster',
  })
  @IsUUID()
  dnsZoneId: string;

  @ApiPropertyOptional({
    enum: CertificateProvider,
    description: 'Certificate provider for TLS',
  })
  @IsOptional()
  @IsEnum(CertificateProvider)
  certificateProvider?: CertificateProvider;

  @ApiPropertyOptional({
    description: 'Email for ACME certificate registration',
  })
  @IsOptional()
  @IsEmail()
  acmeEmail?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Whether to use a wildcard certificate',
  })
  @IsOptional()
  @IsBoolean()
  wildcardCertificate?: boolean;
}
