import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class AddSubnetDto {
  @ApiPropertyOptional({
    description:
      'Network zone for the subnet (default: eu-central for Hetzner)',
    example: 'eu-central',
  })
  @IsOptional()
  @IsString()
  networkZone?: string;

  @ApiPropertyOptional({
    description:
      'IP range in CIDR notation (e.g., 10.0.1.0/28). If not specified, will auto-calculate next available /28 subnet (16 IP addresses).',
    example: '10.0.1.0/28',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, {
    message: 'ipRange must be in valid CIDR notation (e.g., 10.0.0.0/28)',
  })
  ipRange?: string;

  @ApiPropertyOptional({
    description: 'vSwitch ID (only for type: VSWITCH)',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  vswitchId?: string;
}
