import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClusterAutoscaleDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoscalingEnabled?: boolean;

  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  minNodes?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxNodes?: number;

  @ApiPropertyOptional({ example: 80, minimum: 50, maximum: 95 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(95)
  scaleUpMemoryPct?: number;

  @ApiPropertyOptional({ example: 75, minimum: 50, maximum: 95 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(95)
  scaleUpCpuPct?: number;

  @ApiPropertyOptional({ example: 300, minimum: 60, maximum: 3600 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  cooldownSeconds?: number;
}
