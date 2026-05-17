import {
  IsOptional,
  IsBoolean,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FirewallRuleDto } from '../../../providers/dto/firewall.dto';

/**
 * DTO for configuring firewall creation when creating a cluster
 */
export class FirewallConfigDto {
  @ApiPropertyOptional({
    description:
      'Enable or disable firewall creation for the cluster. Default: true',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description:
      'Source CIDR blocks allowed to access the cluster. ' +
      'If not provided, will attempt to auto-detect from request IP. ' +
      'Example: ["1.2.3.4/32", "10.0.0.0/8"]',
    type: [String],
    example: ['1.2.3.4/32', '10.0.0.0/8'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceCidrs?: string[];

  @ApiPropertyOptional({
    description:
      'Custom firewall rules. If not provided, default rules based on cluster type will be used. ' +
      'Observability clusters: SSH, Grafana, Prometheus, PostgreSQL, Redis, Loki, Health endpoint. ' +
      'Workload clusters: SSH, K3s API (6443). ' +
      'Custom rules must include at least SSH (port 22) and outbound traffic.',
    type: [FirewallRuleDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FirewallRuleDto)
  customRules?: FirewallRuleDto[];

  @ApiPropertyOptional({
    description:
      'If true, cluster creation will fail if firewall cannot be created. ' +
      'If false (default), cluster creation will proceed without firewall on providers that do not support it.',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
