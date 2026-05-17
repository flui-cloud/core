import { ApiProperty } from '@nestjs/swagger';

/**
 * Prometheus HTTP Service Discovery Target DTO
 *
 * Represents a single scrape target for Prometheus with associated labels.
 * Used by the /api/v1/observability/prometheus/targets endpoint.
 */
export class PrometheusTargetDto {
  @ApiProperty({
    description: 'List of scrape targets (host:port)',
    example: ['10.0.1.10:9100'],
    type: [String],
  })
  targets: string[];

  @ApiProperty({
    description: 'Labels associated with this target',
    example: {
      server_id: 'srv-123',
      server_type: 'vps',
      cloud_provider: 'hetzner',
      region: 'eu-central',
      job: 'flui-servers',
    },
  })
  labels: Record<string, string>;
}

/**
 * Prometheus Service Discovery Response
 */
export class PrometheusServiceDiscoveryResponseDto {
  @ApiProperty({
    description: 'Array of Prometheus scrape targets',
    type: [PrometheusTargetDto],
  })
  targets: PrometheusTargetDto[];
}
