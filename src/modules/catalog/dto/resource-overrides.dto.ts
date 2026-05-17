import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Kubernetes CPU: "250m" (millicores) or plain number ("1", "2.5")
const CPU_PATTERN = /^(\d+m|\d+(\.\d+)?)$/;

// Kubernetes memory: [0-9]+ with optional binary (Ki,Mi,Gi,Ti) or decimal (K,M,G,T) suffix
const MEMORY_PATTERN = /^\d+(\.\d+)?(Ki|Mi|Gi|Ti|K|M|G|T)?$/;

export class ResourceOverrideCpuDto {
  @ApiPropertyOptional({
    example: '500m',
    description:
      'CPU request override. Accepts "250m" (millicores) or plain number ("1", "2.5" = 2500m). Overrides the manifest default. The cluster capacity check is still enforced — requesting more than available will reject the install.',
  })
  @IsOptional()
  @IsString()
  @Matches(CPU_PATTERN, {
    message: 'cpu request must match K8s pattern (e.g. "250m", "1", "2.5")',
  })
  request?: string;

  @ApiPropertyOptional({
    example: '2',
    description:
      'CPU limit override. Same format as request. Typically >= request.',
  })
  @IsOptional()
  @IsString()
  @Matches(CPU_PATTERN, {
    message: 'cpu limit must match K8s pattern (e.g. "500m", "1", "2")',
  })
  limit?: string;
}

export class ResourceOverrideMemoryDto {
  @ApiPropertyOptional({
    example: '1Gi',
    description:
      'Memory request override. Accepts "512Mi", "2Gi", "1Ti" (binary) or "M/G/T" (decimal). Overrides the manifest default. If you set it below the app\'s real usage you may see OOMKilled.',
  })
  @IsOptional()
  @IsString()
  @Matches(MEMORY_PATTERN, {
    message: 'memory request must match K8s pattern (e.g. "512Mi", "2Gi")',
  })
  request?: string;

  @ApiPropertyOptional({
    example: '2Gi',
    description:
      'Memory limit override. Same format as request. Typically >= request.',
  })
  @IsOptional()
  @IsString()
  @Matches(MEMORY_PATTERN, {
    message: 'memory limit must match K8s pattern (e.g. "1Gi", "4Gi")',
  })
  limit?: string;
}

export class ResourceOverridesDto {
  @ApiPropertyOptional({
    type: ResourceOverrideCpuDto,
    description:
      'CPU override. Both request and limit are optional; whatever is omitted falls back to the manifest default.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourceOverrideCpuDto)
  cpu?: ResourceOverrideCpuDto;

  @ApiPropertyOptional({
    type: ResourceOverrideMemoryDto,
    description:
      'Memory override. Both request and limit are optional; whatever is omitted falls back to the manifest default.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResourceOverrideMemoryDto)
  memory?: ResourceOverrideMemoryDto;

  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    maximum: 20,
    description:
      'Initial replica count override. Only meaningful when horizontal scaling is disabled in the manifest (otherwise HPA takes over). Capped at 20 for safety.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  replicas?: number;
}
