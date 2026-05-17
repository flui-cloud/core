import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportFirewallDto {
  @ApiProperty({
    description: 'The cluster ID to associate the firewall with',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  clusterId: string;

  @ApiProperty({
    description: 'The provider firewall ID (e.g., Hetzner firewall ID)',
    example: '12345678',
  })
  @IsString()
  providerFirewallId: string;
}
