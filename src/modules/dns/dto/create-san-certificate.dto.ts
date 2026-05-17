import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import { CertChallenge } from '../enums/cert-challenge.enum';

export const SAN_CERTIFICATE_MAX_FQDNS = 20;
const FQDN_REGEX =
  /^(?=.{1,253}$)(?!-)([A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}$/;

export class CreateSanCertificateDto {
  @ApiProperty({
    description:
      'Stable name for this SAN certificate within the cluster (used in the Kubernetes Certificate name). Must be unique per cluster.',
    example: 'multi-app-prod',
  })
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{0,62}$/, {
    message:
      'name must be lowercase alphanumeric with hyphens (max 63 chars, no leading/trailing hyphen)',
  })
  name: string;

  @ApiProperty({
    description:
      'List of FQDNs to include as Subject Alternative Names in a single certificate. Max 20 entries.',
    example: ['app1.example.com', 'app2.example.com', 'api.example.com'],
    maxItems: SAN_CERTIFICATE_MAX_FQDNS,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(SAN_CERTIFICATE_MAX_FQDNS)
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(FQDN_REGEX, {
    each: true,
    message: 'each fqdn must be a valid hostname',
  })
  fqdns: string[];

  @ApiProperty({
    enum: CertChallenge,
    description:
      'ACME challenge. HTTP-01 allows fqdns from any zone (each must resolve to the cluster). DNS-01 requires all fqdns under the same clusterDnsZoneId.',
  })
  @IsEnum(CertChallenge)
  certChallenge: CertChallenge;

  @ApiPropertyOptional({
    description:
      'Required when certChallenge=dns-01. All fqdns must fall under this zone.',
  })
  @IsOptional()
  @IsUUID()
  clusterDnsZoneId?: string;

  @ApiPropertyOptional({
    enum: CertificateProvider,
    default: CertificateProvider.LETS_ENCRYPT,
    description:
      'ACME provider. Use LETS_ENCRYPT_STAGING to test before switching to production.',
  })
  @IsOptional()
  @IsEnum(CertificateProvider)
  certificateProvider?: CertificateProvider;
}
