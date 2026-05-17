export interface ApplicationManifestEnvVar {
  name: string;
  value?: string;
  valueFrom?: {
    generate?: 'secret';
    length?: number;
    format?: 'base64url' | 'hex';
    secretRef?: string;
    userInput?: {
      label?: string;
      default?: string;
      sensitive?: boolean;
      placeholder?: string;
      format?: 'email' | 'url' | 'password' | 'text';
    };
  };
  userEditable?: boolean;
  description?: string;
}

export interface ApplicationManifestResources {
  profile?: 'nano' | 'small' | 'medium' | 'large' | 'xlarge';
  requests?: { cpu?: string; memory?: string };
  limits?: { cpu?: string; memory?: string };
}

export interface ApplicationManifestHealthcheck {
  path: string;
  port?: number;
}

export interface ApplicationManifestScaling {
  min?: number;
  max?: number;
}

export interface ApplicationManifestDomain {
  /** Auto-create an AppEndpoint after deploy. Default: true */
  auto?: boolean;
  /** Provision a TLS certificate. Default: true */
  tls?: boolean;
  /**
   * Explicit FQDN to expose the app on (e.g. `flui.cloud` for an apex,
   * `marketing.acme.io` for a subdomain on a different zone). When set, the
   * cluster's assigned DNS zone is bypassed for hostname generation —
   * the value is taken verbatim. Required when targeting an apex or a
   * hostname outside the cluster's default zone.
   */
  fqdn?: string;
  /**
   * Hostname source.
   * - `ip` (default when no DNS zone): nip.io hostname against the cluster master IP
   * - `domain`: real DNS zone (requires a configured ClusterDnsZone)
   */
  hostnameMode?: 'ip' | 'domain';
  /**
   * ACME challenge type. `http-01` works without DNS provider integration.
   * `dns-01` requires a configured DNS zone and supports wildcard certs.
   * If omitted, derived from cluster config (IP mode forces http-01).
   */
  certChallenge?: 'http-01' | 'dns-01';
  /**
   * Certificate provider. Use `lets-encrypt-staging` for testing without
   * hitting Let's Encrypt rate limits.
   */
  certificateProvider?: 'lets-encrypt' | 'lets-encrypt-staging';
  userCustomizable?: boolean;
}

export interface ApplicationManifestVolume {
  name: string;
  mountPath: string;
  size?: string;
}

export interface ApplicationManifest {
  kind: 'Application';
  apiVersion: 'flui/v1';
  metadata: {
    /** Stable slug used as the app identifier — must be `^[a-z][a-z0-9-]{0,62}$` */
    name: string;
  };
  build?: {
    /** Build strategy. `dockerfile` uses the Dockerfile in the repo. `auto` lets railpack detect the framework. Default: `dockerfile` */
    strategy?: 'dockerfile' | 'auto';
    /** Path to Dockerfile relative to repo root. Default: `./Dockerfile` */
    dockerfile?: string;
    /** Build context relative to repo root. Default: `.` */
    context?: string;
  };
  deploy: {
    port: number;
    exposure?: 'public' | 'internal';
    healthcheck?: ApplicationManifestHealthcheck;
    resources?: ApplicationManifestResources;
    scaling?: ApplicationManifestScaling;
    domain?: ApplicationManifestDomain;
    env?: ApplicationManifestEnvVar[];
    volumes?: ApplicationManifestVolume[];
    startCommand?: string;
  };
}
