import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ScaleNodeDto {
  @ApiProperty({
    description:
      'Target provider server type (e.g. `cx32` on Hetzner, `PRO2-S` on Scaleway). Must differ from the current type.',
  })
  @IsString()
  targetServerType: string;

  @ApiPropertyOptional({
    description:
      'Hetzner-only: if true, also grow the local OS disk. One-way — once enabled, the server can never resize back down to a smaller type. Default false.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  upgradeDisk?: boolean;
}

export class ExpandSharedVolumeDto {
  @ApiProperty({
    description: 'New size in GB. Must be greater than current size.',
  })
  @IsInt()
  @Min(1)
  targetSizeGb: number;
}
