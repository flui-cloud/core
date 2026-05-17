import {
  IsString,
  IsIn,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  Matches,
  ValidateIf,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FirewallRuleDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Rule ID must be lowercase alphanumeric with hyphens (kebab-case)',
  })
  id?: string;

  @IsString()
  description: string;

  @IsIn(['in', 'out'])
  direction: 'in' | 'out';

  @IsIn(['tcp', 'udp', 'icmp'])
  protocol: 'tcp' | 'udp' | 'icmp';

  @IsOptional()
  @IsString()
  port?: string;

  // For inbound rules, sourceIps is required
  @ValidateIf((o) => o.direction === 'in')
  @IsArray()
  @ArrayMinSize(1, {
    message:
      'sourceIps is required for inbound rules and must contain at least one IP address (e.g., ["0.0.0.0/0", "::/0"])',
  })
  @IsString({ each: true })
  sourceIps?: string[];

  // For outbound rules, destinationIps is required
  @ValidateIf((o) => o.direction === 'out')
  @IsArray()
  @ArrayMinSize(1, {
    message:
      'destinationIps is required for outbound rules and must contain at least one IP address (e.g., ["0.0.0.0/0", "::/0"])',
  })
  @IsString({ each: true })
  destinationIps?: string[];
}

export class CreateFirewallDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FirewallRuleDto)
  rules: FirewallRuleDto[];

  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applyToServerIds?: string[];

  @IsOptional()
  @IsString()
  applyToLabelSelector?: string;
}

export class ProviderUpdateFirewallRulesDto {
  @IsString()
  firewallId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FirewallRuleDto)
  rules: FirewallRuleDto[];
}

export class ProviderFirewallDto {
  id: string;
  name: string;
  provider: string;
  rules: FirewallRuleDto[];
  appliedToServerCount: number;
  labels: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
