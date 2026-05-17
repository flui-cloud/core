import { TopologyAppCategory, TopologyAppKind } from '../enums/topology.enums';

const SYSTEM_NAME_PATTERNS: RegExp[] = [
  /^cert-manager/i,
  /^sealed-secrets/i,
  /^external-dns/i,
  /^velero/i,
  /^reloader/i,
  /^node-exporter/i,
  /^traefik/i,
  /^kube-/i,
  /^prometheus/i,
  /^loki/i,
  /^grafana/i,
  /^tempo/i,
  /^alertmanager/i,
  /^jaeger/i,
  /^otel/i,
];

export function resolveTopologyKind(
  name: string,
  declaredKind?: string | null,
): TopologyAppKind {
  if (declaredKind) {
    const lower = declaredKind.toLowerCase();
    if (lower === 'system') return TopologyAppKind.SYSTEM;
    if (lower === 'user' || lower === 'application' || lower === 'tool') {
      return TopologyAppKind.USER;
    }
  }
  if (SYSTEM_NAME_PATTERNS.some((re) => re.test(name))) {
    return TopologyAppKind.SYSTEM;
  }
  return TopologyAppKind.USER;
}

const CATEGORY_PATTERNS: ReadonlyArray<{
  category: TopologyAppCategory;
  patterns: RegExp[];
}> = [
  {
    category: TopologyAppCategory.DATABASE,
    patterns: [
      /postgres/i,
      /mysql/i,
      /mariadb/i,
      /mongo/i,
      /clickhouse/i,
      /cockroach/i,
      /timescale/i,
      /influxdb/i,
      /cassandra/i,
      /elastic/i,
    ],
  },
  {
    category: TopologyAppCategory.CACHE,
    patterns: [/redis/i, /valkey/i, /memcached/i, /dragonfly/i],
  },
  {
    category: TopologyAppCategory.STORAGE,
    patterns: [/minio/i, /seaweed/i, /^s3-/i, /ceph/i, /longhorn/i],
  },
  {
    category: TopologyAppCategory.AUTOMATION,
    patterns: [/n8n/i, /temporal/i, /airflow/i, /argo-workflows/i],
  },
  {
    category: TopologyAppCategory.MEDIA,
    patterns: [
      /immich/i,
      /jellyfin/i,
      /paperless/i,
      /navidrome/i,
      /plex/i,
      /sonarr/i,
      /radarr/i,
    ],
  },
  {
    category: TopologyAppCategory.MONITORING,
    patterns: [
      /prometheus/i,
      /grafana/i,
      /loki/i,
      /tempo/i,
      /alertmanager/i,
      /jaeger/i,
      /otel/i,
      /node-exporter/i,
      /metrics-server/i,
    ],
  },
  {
    category: TopologyAppCategory.INFRA,
    patterns: [
      /traefik/i,
      /nginx-ingress/i,
      /ingress-nginx/i,
      /cert-manager/i,
      /sealed-secrets/i,
      /external-dns/i,
      /reloader/i,
      /velero/i,
      /registry/i,
      /rabbitmq/i,
      /kafka/i,
      /nats/i,
      /^kube-/i,
    ],
  },
];

export function resolveTopologyCategory(
  name: string,
  kind: TopologyAppKind,
  declaredCategory?: string | null,
): TopologyAppCategory {
  if (declaredCategory) {
    const normalized = declaredCategory.toLowerCase();
    const match = Object.values(TopologyAppCategory).find(
      (c) => c === normalized,
    );
    if (match) return match as TopologyAppCategory;
  }

  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some((re) => re.test(name))) return category;
  }

  if (kind === TopologyAppKind.SYSTEM) return TopologyAppCategory.INFRA;
  return TopologyAppCategory.WEB;
}
