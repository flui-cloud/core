import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a Grafana datasource via API
 */
export class GrafanaDatasourceDto {
  @ApiProperty({
    description: 'Datasource name',
    example: 'Cluster production-app - Prometheus',
  })
  name: string;

  @ApiProperty({
    description: 'Datasource type',
    enum: ['prometheus', 'loki', 'tempo', 'postgres'],
    example: 'prometheus',
  })
  type: 'prometheus' | 'loki' | 'tempo' | 'postgres';

  @ApiProperty({
    description: 'Unique identifier for the datasource',
    example: 'cluster-abc123-prometheus',
  })
  uid: string;

  @ApiProperty({
    description: 'URL of the datasource',
    example: 'http://10.0.1.5:9090',
  })
  url: string;

  @ApiProperty({
    description: 'Access mode',
    enum: ['proxy', 'direct'],
    example: 'proxy',
  })
  access: 'proxy' | 'direct';

  @ApiProperty({
    description: 'Whether this datasource is the default',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Additional JSON data for datasource configuration',
    required: false,
    example: { timeInterval: '60s' },
  })
  jsonData?: Record<string, any>;

  @ApiProperty({
    description: 'Secure JSON data (passwords, tokens, etc.)',
    required: false,
  })
  secureJsonData?: Record<string, any>;
}

/**
 * DTO for requesting creation of cluster datasources
 */
export class CreateClusterDatasourcesDto {
  @ApiProperty({
    description: 'Cluster ID',
    example: 'abc123-def456-ghi789',
  })
  clusterId: string;

  @ApiProperty({
    description: 'Cluster name',
    example: 'production-app',
  })
  clusterName: string;

  @ApiProperty({
    description: 'Master node IP address',
    example: '10.0.1.5',
  })
  masterIpAddress: string;
}

/**
 * DTO for Grafana datasource response
 */
export class GrafanaDatasourceResponseDto {
  @ApiProperty({
    description: 'Datasource ID (internal Grafana ID)',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Unique identifier',
    example: 'cluster-abc123-prometheus',
  })
  uid: string;

  @ApiProperty({
    description: 'Datasource name',
    example: 'Cluster production-app - Prometheus',
  })
  name: string;

  @ApiProperty({
    description: 'Datasource type',
    example: 'prometheus',
  })
  type: string;

  @ApiProperty({
    description: 'Datasource URL',
    example: 'http://10.0.1.5:9090',
  })
  url: string;

  @ApiProperty({
    description: 'Whether this is the default datasource',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Access mode',
    example: 'proxy',
  })
  access: string;
}

/**
 * DTO for control cluster endpoints
 */
export class ObservabilityEndpointsDto {
  @ApiProperty({
    description: 'Prometheus endpoint URL',
    example: 'http://prometheus.flui.cloud',
  })
  prometheus: string;

  @ApiProperty({
    description: 'Loki endpoint URL',
    example: 'http://loki.flui.cloud',
  })
  loki: string;

  @ApiProperty({
    description: 'Grafana endpoint URL',
    example: 'http://grafana.flui.cloud',
  })
  grafana: string;

  @ApiProperty({
    description: 'PostgreSQL endpoint URL',
    example: 'postgresql://fluicloud:***@localhost:5432 (kubectl port-forward)',
    required: false,
  })
  postgres?: string;

  @ApiProperty({
    description: 'Redis endpoint URL',
    example: 'redis://:***@localhost:6379 (kubectl port-forward)',
    required: false,
  })
  redis?: string;

  @ApiProperty({
    description: 'Flui API endpoint URL',
    example: 'http://api.flui.cloud',
    required: false,
  })
  fluiApi?: string;
}
