import { ApiPropertyOptional } from '@nestjs/swagger';

export class SystemAppDnsStatusDto {
  @ApiPropertyOptional({ description: 'Application entity ID' })
  applicationId?: string | null;

  @ApiPropertyOptional({
    description: 'AppEndpoint entity ID, null if no endpoint configured yet',
  })
  endpointId?: string | null;

  @ApiPropertyOptional({
    description: 'Configured domain (FQDN), null if not configured yet',
  })
  domain: string | null;

  @ApiPropertyOptional({
    description: 'Whether the ingress/IngressRoute is configured',
  })
  ingressConfigured?: boolean;

  @ApiPropertyOptional({
    description: 'Whether a TLS certificate is configured',
  })
  certConfigured?: boolean;

  @ApiPropertyOptional({ description: 'Certificate status', nullable: true })
  certStatus?: string | null;

  @ApiPropertyOptional({
    description: 'Certificate status message',
    nullable: true,
  })
  certMessage?: string | null;

  @ApiPropertyOptional({
    description:
      'Staging cert configured and valid (provider=lets_encrypt_staging AND status=valid)',
  })
  stagingCertConfigured?: boolean;

  @ApiPropertyOptional({
    description:
      'Production cert configured and valid (provider=lets_encrypt AND status=valid)',
  })
  prodCertConfigured?: boolean;

  @ApiPropertyOptional({
    description:
      'True if sync was run and syncedDomain matches current domain. Resets to false if domain changes.',
  })
  synced?: boolean;

  @ApiPropertyOptional({
    description:
      'The FQDN that was active when the last sync was executed. Null if never synced.',
    nullable: true,
  })
  syncedDomain?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp of last successful sync, null if never synced.',
    nullable: true,
  })
  lastSyncedAt?: Date | null;
}

export class SystemDnsStatusResponseDto {
  @ApiPropertyOptional({ type: SystemAppDnsStatusDto })
  fluiApi: SystemAppDnsStatusDto;

  @ApiPropertyOptional({ type: SystemAppDnsStatusDto })
  fluiWeb: SystemAppDnsStatusDto;

  @ApiPropertyOptional({
    type: SystemAppDnsStatusDto,
    nullable: true,
    description: 'null when auth mode is local (Zitadel not used)',
  })
  zitadel: SystemAppDnsStatusDto | null;
}
