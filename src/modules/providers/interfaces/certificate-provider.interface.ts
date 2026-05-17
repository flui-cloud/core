import { DnsProvider } from '../enums/dns-provider.enum';

export enum CertificateStatus {
  PENDING = 'pending',
  ISSUING = 'issuing',
  VALID = 'valid',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export interface CertificateInfo {
  domain: string;
  issuer: string;
  status: CertificateStatus;
  notBefore?: Date;
  notAfter?: Date;
  serialNumber?: string;
}

export interface CertificateIssuerConfig {
  email: string;
  server: string;
  privateKeySecretRef: string;
  solverType: 'dns01' | 'http01';
  dnsProvider?: DnsProvider;
}

export interface CertificateManifestConfig {
  name: string;
  namespace: string;
  domains: string[];
  issuerName: string;
  secretName: string;
}

export interface ICertificateProvider {
  generateClusterIssuerManifest(config: CertificateIssuerConfig): string;

  generateCertificateManifest(config: CertificateManifestConfig): string;

  validateConfiguration(config: CertificateIssuerConfig): {
    valid: boolean;
    errors: string[];
  };
}
