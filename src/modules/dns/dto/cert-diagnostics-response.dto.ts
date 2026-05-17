import { ApiProperty } from '@nestjs/swagger';

export class AcmeChallengeInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  dnsName: string;

  @ApiProperty({ description: 'http-01 or dns-01' })
  type: string;

  @ApiProperty({ description: 'pending | valid | invalid | expired' })
  status: string;

  @ApiProperty({ nullable: true })
  reason: string | null;

  @ApiProperty({ nullable: true })
  message: string | null;

  @ApiProperty({ nullable: true, description: 'ACME challenge URL' })
  url: string | null;
}

export class AcmeOrderInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty({
    description: 'pending | ready | processing | valid | invalid',
  })
  state: string;

  @ApiProperty({ nullable: true })
  reason: string | null;

  @ApiProperty({ nullable: true })
  message: string | null;

  @ApiProperty({
    nullable: true,
    description: 'ISO timestamp of when order failed',
  })
  failureTime: string | null;

  @ApiProperty({ nullable: true, description: 'ACME order URL' })
  url: string | null;

  @ApiProperty({ type: [AcmeChallengeInfoDto] })
  challenges: AcmeChallengeInfoDto[];
}

export class CertificateRequestInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  ready: boolean | null;

  @ApiProperty({ nullable: true })
  reason: string | null;

  @ApiProperty({ nullable: true })
  message: string | null;

  @ApiProperty({
    nullable: true,
    description: 'ISO timestamp of when request failed',
  })
  failureTime: string | null;

  @ApiProperty({ nullable: true, type: () => AcmeOrderInfoDto })
  order: AcmeOrderInfoDto | null;
}

export class CertificateDiagnosticsDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty({ nullable: true })
  ready: boolean | null;

  @ApiProperty({ nullable: true })
  reason: string | null;

  @ApiProperty({ nullable: true })
  message: string | null;

  @ApiProperty({ nullable: true, description: 'Certificate expiry (ISO)' })
  notAfter: string | null;

  @ApiProperty({
    nullable: true,
    description: 'cert-manager scheduled renewal time (ISO)',
  })
  renewalTime: string | null;

  @ApiProperty({ type: [CertificateRequestInfoDto] })
  requests: CertificateRequestInfoDto[];
}

export class CertDiagnosticsResponseDto {
  @ApiProperty()
  clusterId: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty({ type: [CertificateDiagnosticsDto] })
  certificates: CertificateDiagnosticsDto[];
}
