import { BadRequestException, Injectable } from '@nestjs/common';
import { ClusterEntity } from '../../infrastructure/clusters/entities/cluster.entity';
import { ClusterDnsZoneEntity } from '../entities/cluster-dns-zone.entity';
import { CertChallenge } from '../enums/cert-challenge.enum';
import { HostnameMode } from '../enums/hostname-mode.enum';
import { buildAppNipHostname } from '../utils/nip-hostname.util';

export interface ResolveEndpointModeInput {
  cluster: ClusterEntity;
  clusterDnsZone?: ClusterDnsZoneEntity | null;
  wildcardEnabled?: boolean;
  requestedFqdn?: string;
  requestedCertChallenge?: CertChallenge;
  requestedHostnameMode?: HostnameMode;
  slug: string;
}

export interface ResolvedEndpointMode {
  certChallenge: CertChallenge;
  hostnameMode: HostnameMode;
  fqdn: string;
}

@Injectable()
export class EndpointModeResolverService {
  resolve(input: ResolveEndpointModeInput): ResolvedEndpointMode {
    const {
      cluster,
      clusterDnsZone,
      wildcardEnabled,
      requestedFqdn,
      requestedCertChallenge,
      requestedHostnameMode,
      slug,
    } = input;

    const hostnameMode =
      requestedHostnameMode ??
      (clusterDnsZone
        ? HostnameMode.DOMAIN
        : (cluster.endpointHostnameMode ?? HostnameMode.IP));

    let certChallenge: CertChallenge;
    if (hostnameMode === HostnameMode.IP) {
      if (
        requestedCertChallenge &&
        requestedCertChallenge !== CertChallenge.HTTP_01
      ) {
        throw new BadRequestException(
          'IP-based endpoints (nip.io) only support HTTP-01 challenge',
        );
      }
      certChallenge = CertChallenge.HTTP_01;
    } else {
      certChallenge =
        requestedCertChallenge ??
        (wildcardEnabled && clusterDnsZone
          ? CertChallenge.DNS_01
          : CertChallenge.HTTP_01);
      if (certChallenge === CertChallenge.DNS_01 && !clusterDnsZone) {
        throw new BadRequestException(
          'DNS-01 challenge requires a cluster DNS zone',
        );
      }
    }

    if (
      hostnameMode === HostnameMode.DOMAIN &&
      !clusterDnsZone &&
      !requestedFqdn
    ) {
      throw new BadRequestException(
        'DOMAIN hostname mode requires either a cluster DNS zone or an explicit fqdn',
      );
    }

    const fqdn =
      requestedFqdn ??
      this.generateFqdn(hostnameMode, slug, cluster, clusterDnsZone);

    return { certChallenge, hostnameMode, fqdn };
  }

  generateFqdn(
    mode: HostnameMode,
    slug: string,
    cluster: ClusterEntity,
    clusterDnsZone?: ClusterDnsZoneEntity | null,
  ): string {
    if (mode === HostnameMode.IP) {
      const ip = cluster.masterIpAddress;
      if (!ip) {
        throw new BadRequestException(
          `Cluster ${cluster.id} has no master IP yet — cannot derive nip.io hostname`,
        );
      }
      return buildAppNipHostname(slug, ip);
    }
    if (clusterDnsZone?.dnsZone) {
      return `${slug}.${cluster.name}.${clusterDnsZone.dnsZone.zoneName}`;
    }
    return `${slug}.${cluster.name}`;
  }
}
