import {
  TopologyAppCategory,
  TopologyAppKind,
  TopologyAppStatus,
  TopologyHealthStatus,
  TopologyScalingMode,
  TopologyServerRole,
} from '../enums/topology.enums';
import {
  TopologyAppDto,
  TopologyClusterDto,
  TopologyResponseDto,
  TopologyServerDto,
} from '../dto/topology.dto';
import { makeTopologySlug } from '../utils/slug.util';

const server = (
  id: string,
  name: string,
  role: TopologyServerRole,
  cpuCores: number,
  memoryMB: number,
  storageGB: number,
): TopologyServerDto => ({
  id,
  name,
  displayName: name,
  role,
  status: TopologyHealthStatus.HEALTHY,
  specs: { cpuCores, memoryMB, storageGB },
});

const app = (params: {
  id: string;
  name: string;
  displayName?: string;
  category: TopologyAppCategory;
  kind: TopologyAppKind;
  namespace: string;
  status?: TopologyAppStatus;
  statusReason?: string | null;
  ramRequestMB?: number;
  ramLimitMB?: number;
  cpuRequestM?: number;
  cpuLimitM?: number;
  primaryServerId: string;
  replicas?: Array<{ serverId: string; count: number }>;
  scalingMode?: TopologyScalingMode;
  scalingNote?: string | null;
}): TopologyAppDto => {
  const replicas = params.replicas ?? [
    { serverId: params.primaryServerId, count: 1 },
  ];
  const replicaCount = replicas.reduce((s, r) => s + r.count, 0);
  return {
    id: params.id,
    name: params.name,
    slug: makeTopologySlug(params.name),
    displayName: params.displayName ?? params.name,
    category: params.category,
    kind: params.kind,
    namespace: params.namespace,
    status: params.status ?? TopologyAppStatus.RUNNING,
    statusReason: params.statusReason ?? null,
    ramRequestMB: params.ramRequestMB ?? 256,
    ramLimitMB: params.ramLimitMB ?? 512,
    cpuRequestM: params.cpuRequestM ?? 100,
    cpuLimitM: params.cpuLimitM ?? 500,
    primaryServerId: params.primaryServerId,
    replicas,
    replicaCount,
    scalingMode: params.scalingMode ?? TopologyScalingMode.MANUAL,
    scalingNote: params.scalingNote ?? null,
    labels: {},
  };
};

function buildProdEuWest(): TopologyClusterDto {
  const s1 = server(
    'prod-eu-w-1',
    'prod-eu-w-1',
    TopologyServerRole.CONTROL_PLANE,
    4,
    8192,
    80,
  );
  const s2 = server(
    'prod-eu-w-2',
    'prod-eu-w-2',
    TopologyServerRole.WORKER,
    8,
    16384,
    160,
  );
  const s3 = server(
    'prod-eu-w-3',
    'prod-eu-w-3',
    TopologyServerRole.WORKER,
    8,
    16384,
    160,
  );
  const servers = [s1, s2, s3];

  const apps: TopologyAppDto[] = [
    app({
      id: 'app-cert-manager',
      name: 'cert-manager',
      category: TopologyAppCategory.INFRA,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'cert-manager',
      primaryServerId: s1.id,
      ramRequestMB: 64,
      cpuRequestM: 50,
    }),
    app({
      id: 'app-traefik',
      name: 'traefik',
      category: TopologyAppCategory.INFRA,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'traefik',
      primaryServerId: s1.id,
      replicas: [
        { serverId: s1.id, count: 1 },
        { serverId: s2.id, count: 1 },
        { serverId: s3.id, count: 1 },
      ],
      scalingMode: TopologyScalingMode.DAEMONSET,
      scalingNote: 'DaemonSet · 1 per node',
    }),
    app({
      id: 'app-prometheus',
      name: 'prometheus',
      category: TopologyAppCategory.MONITORING,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'monitoring',
      primaryServerId: s2.id,
      ramRequestMB: 1024,
      ramLimitMB: 2048,
    }),
    app({
      id: 'app-grafana',
      name: 'grafana',
      category: TopologyAppCategory.MONITORING,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'monitoring',
      primaryServerId: s2.id,
      ramRequestMB: 256,
    }),
    app({
      id: 'app-loki',
      name: 'loki',
      category: TopologyAppCategory.MONITORING,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'monitoring',
      primaryServerId: s3.id,
    }),
    app({
      id: 'app-postgres-main',
      name: 'postgres-main',
      displayName: 'Postgres (Primary)',
      category: TopologyAppCategory.DATABASE,
      kind: TopologyAppKind.USER,
      namespace: 'data',
      primaryServerId: s2.id,
      ramRequestMB: 2048,
      ramLimitMB: 4096,
      replicas: [
        { serverId: s2.id, count: 1 },
        { serverId: s3.id, count: 1 },
      ],
      scalingMode: TopologyScalingMode.STATEFULSET,
      scalingNote: 'primary+standby',
    }),
    app({
      id: 'app-redis-cache',
      name: 'redis-cache',
      category: TopologyAppCategory.CACHE,
      kind: TopologyAppKind.USER,
      namespace: 'data',
      primaryServerId: s3.id,
      ramRequestMB: 512,
    }),
    app({
      id: 'app-minio',
      name: 'minio',
      category: TopologyAppCategory.STORAGE,
      kind: TopologyAppKind.USER,
      namespace: 'storage',
      primaryServerId: s2.id,
      ramRequestMB: 512,
    }),
    app({
      id: 'app-ristoclick-api',
      name: 'ristoclick-api',
      displayName: 'RistoClick API',
      category: TopologyAppCategory.BUSINESS,
      kind: TopologyAppKind.USER,
      namespace: 'ristoclick',
      primaryServerId: s2.id,
      replicas: [
        { serverId: s2.id, count: 2 },
        { serverId: s3.id, count: 2 },
      ],
      scalingMode: TopologyScalingMode.HPA,
      scalingNote: 'HPA · 4 replicas',
    }),
    app({
      id: 'app-ristoclick-web',
      name: 'ristoclick-web',
      displayName: 'RistoClick Web',
      category: TopologyAppCategory.BUSINESS,
      kind: TopologyAppKind.USER,
      namespace: 'ristoclick',
      primaryServerId: s3.id,
    }),
    app({
      id: 'app-n8n',
      name: 'n8n',
      category: TopologyAppCategory.AUTOMATION,
      kind: TopologyAppKind.USER,
      namespace: 'automation',
      primaryServerId: s3.id,
    }),
    app({
      id: 'app-immich',
      name: 'immich',
      category: TopologyAppCategory.MEDIA,
      kind: TopologyAppKind.USER,
      namespace: 'media',
      primaryServerId: s2.id,
    }),
    app({
      id: 'app-broken-1',
      name: 'broken-worker',
      category: TopologyAppCategory.WEB,
      kind: TopologyAppKind.USER,
      namespace: 'apps',
      primaryServerId: s3.id,
      status: TopologyAppStatus.ERROR,
      statusReason: 'CrashLoopBackOff',
    }),
    app({
      id: 'app-oom-1',
      name: 'memory-hog',
      category: TopologyAppCategory.WEB,
      kind: TopologyAppKind.USER,
      namespace: 'apps',
      primaryServerId: s3.id,
      status: TopologyAppStatus.ERROR,
      statusReason: 'OOMKilled',
    }),
    app({
      id: 'app-cert-warn',
      name: 'public-frontend',
      category: TopologyAppCategory.WEB,
      kind: TopologyAppKind.USER,
      namespace: 'apps',
      primaryServerId: s2.id,
      status: TopologyAppStatus.WARNING,
      statusReason: 'Cert expiring in 3 days',
    }),
    app({
      id: 'app-backup-warn',
      name: 'invoice-db',
      category: TopologyAppCategory.DATABASE,
      kind: TopologyAppKind.USER,
      namespace: 'finance',
      primaryServerId: s2.id,
      status: TopologyAppStatus.WARNING,
      statusReason: 'Backup overdue',
    }),
    app({
      id: 'app-stopped-1',
      name: 'staging-preview',
      category: TopologyAppCategory.WEB,
      kind: TopologyAppKind.USER,
      namespace: 'staging',
      primaryServerId: s3.id,
      status: TopologyAppStatus.STOPPED,
      statusReason: null,
    }),
  ];

  // Pad to ≥20 apps with synthetic web apps
  for (let i = 0; i < 6; i++) {
    apps.push(
      app({
        id: `app-padding-${i}`,
        name: `microsvc-${i + 1}`,
        category: TopologyAppCategory.WEB,
        kind: TopologyAppKind.USER,
        namespace: 'apps',
        primaryServerId: i % 2 === 0 ? s2.id : s3.id,
      }),
    );
  }

  return {
    id: 'prod-eu-west',
    name: 'prod-eu-west',
    displayName: 'Production EU West',
    provider: 'hetzner',
    region: 'fsn1',
    status: TopologyHealthStatus.HEALTHY,
    servers,
    apps,
  };
}

function buildStagingEuCentral(): TopologyClusterDto {
  const s1 = server(
    'stg-eu-c-1',
    'stg-eu-c-1',
    TopologyServerRole.CONTROL_PLANE,
    2,
    4096,
    40,
  );
  const s2 = server(
    'stg-eu-c-2',
    'stg-eu-c-2',
    TopologyServerRole.WORKER,
    4,
    8192,
    80,
  );
  const servers = [s1, s2];
  const apps: TopologyAppDto[] = [
    app({
      id: 'app-stg-traefik',
      name: 'traefik',
      category: TopologyAppCategory.INFRA,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'traefik',
      primaryServerId: s1.id,
      replicas: [
        { serverId: s1.id, count: 1 },
        { serverId: s2.id, count: 1 },
      ],
      scalingMode: TopologyScalingMode.DAEMONSET,
      scalingNote: 'DaemonSet · 1 per node',
    }),
    app({
      id: 'app-stg-postgres',
      name: 'postgres-staging',
      category: TopologyAppCategory.DATABASE,
      kind: TopologyAppKind.USER,
      namespace: 'data',
      primaryServerId: s2.id,
      scalingMode: TopologyScalingMode.STATEFULSET,
    }),
    app({
      id: 'app-stg-app',
      name: 'app-staging',
      category: TopologyAppCategory.WEB,
      kind: TopologyAppKind.USER,
      namespace: 'apps',
      primaryServerId: s2.id,
    }),
  ];
  return {
    id: 'staging-eu-central',
    name: 'staging-eu-central',
    displayName: 'Staging EU Central',
    provider: 'hetzner',
    region: 'nbg1',
    status: TopologyHealthStatus.DEGRADED,
    servers,
    apps,
  };
}

function buildEdgeFr(): TopologyClusterDto {
  const s1 = server(
    'edge-fr-1',
    'edge-fr-1',
    TopologyServerRole.CONTROL_PLANE,
    2,
    4096,
    40,
  );
  const servers = [s1];
  const apps: TopologyAppDto[] = [
    app({
      id: 'app-edge-traefik',
      name: 'traefik',
      category: TopologyAppCategory.INFRA,
      kind: TopologyAppKind.SYSTEM,
      namespace: 'traefik',
      primaryServerId: s1.id,
      scalingMode: TopologyScalingMode.DAEMONSET,
    }),
    app({
      id: 'app-edge-cdn',
      name: 'cdn-cache',
      category: TopologyAppCategory.CACHE,
      kind: TopologyAppKind.USER,
      namespace: 'edge',
      primaryServerId: s1.id,
    }),
  ];
  return {
    id: 'edge-fr-par',
    name: 'edge-fr-par',
    displayName: 'Edge FR Paris',
    provider: 'scaleway',
    region: 'fr-par',
    status: TopologyHealthStatus.HEALTHY,
    servers,
    apps,
  };
}

export function buildMockTopology(): TopologyResponseDto {
  const clusters = [buildProdEuWest(), buildStagingEuCentral(), buildEdgeFr()];

  let totalServers = 0;
  let totalApps = 0;
  let totalReplicas = 0;
  let totalRamMB = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const c of clusters) {
    totalServers += c.servers.length;
    totalApps += c.apps.length;
    for (const a of c.apps) {
      totalReplicas += a.replicaCount;
      totalRamMB += a.ramRequestMB * a.replicaCount;
      if (a.status === TopologyAppStatus.ERROR) errorCount++;
      else if (a.status === TopologyAppStatus.WARNING) warningCount++;
    }
  }

  return {
    version: '1',
    fetchedAt: new Date().toISOString(),
    clusters,
    stats: {
      totalClusters: clusters.length,
      totalServers,
      totalApps,
      totalReplicas,
      totalRamMB,
      errorCount,
      warningCount,
    },
  };
}
