import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';
import { CertificateStatus } from '../../providers/interfaces/certificate-provider.interface';
import { ReconciliationStatus } from '../../infrastructure/shared/enums/reconciliation-status.enum';
import { CertChallenge } from '../enums/cert-challenge.enum';
import { SanCertificateEntity } from '../entities/san-certificate.entity';

export class SanCertificateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clusterId: string;

  @ApiPropertyOptional({ nullable: true })
  clusterDnsZoneId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  dnsNames: string[];

  @ApiProperty({ enum: CertChallenge })
  certChallenge: CertChallenge;

  @ApiProperty({ enum: CertificateProvider })
  certificateProvider: CertificateProvider;

  @ApiProperty()
  masterNamespace: string;

  @ApiProperty()
  masterCertName: string;

  @ApiProperty()
  masterSecretName: string;

  @ApiProperty()
  issuerName: string;

  @ApiProperty({ enum: CertificateStatus })
  status: CertificateStatus;

  @ApiProperty({ enum: ReconciliationStatus })
  reconciliationStatus: ReconciliationStatus;

  @ApiPropertyOptional({ nullable: true })
  notAfter: Date | null;

  @ApiPropertyOptional({ nullable: true })
  renewalTime: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastReconciliationAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  errorMessage: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: SanCertificateEntity): SanCertificateResponseDto {
    return {
      id: entity.id,
      clusterId: entity.clusterId,
      clusterDnsZoneId: entity.clusterDnsZoneId,
      name: entity.name,
      dnsNames: entity.dnsNames,
      certChallenge: entity.certChallenge,
      certificateProvider: entity.certificateProvider,
      masterNamespace: entity.masterNamespace,
      masterCertName: entity.masterCertName,
      masterSecretName: entity.masterSecretName,
      issuerName: entity.issuerName,
      status: entity.status,
      reconciliationStatus: entity.reconciliationStatus,
      notAfter: entity.notAfter ?? null,
      renewalTime: entity.renewalTime ?? null,
      lastReconciliationAt: entity.lastReconciliationAt ?? null,
      errorMessage: entity.errorMessage ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
