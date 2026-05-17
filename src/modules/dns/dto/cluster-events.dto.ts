export class IssuerStatusDto {
  clusterId: string;
  issuerName: string;
  ready: boolean;
  message: string;
  timestamp: Date;
}

export class IssuerConfiguredDto {
  clusterId: string;
  issuers: { name: string; ready: boolean; email: string | null }[];
  duration: number;
  timestamp: Date;
}

export class IssuerConfigurationFailedDto {
  clusterId: string;
  error: string;
  timestamp: Date;
}

export class IssuerDeletedDto {
  clusterId: string;
  deletedIssuers: string[];
  timestamp: Date;
}

export class IssuerDeletionFailedDto {
  clusterId: string;
  error: string;
  timestamp: Date;
}
