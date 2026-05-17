import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIP,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachServerToSubnetDto {
  @ApiProperty({
    description: 'Server ID (provider resource ID) to attach to the subnet',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiPropertyOptional({
    description:
      'Specific IP address to assign within the subnet range (auto-assigned if not provided)',
    example: '10.0.1.10',
  })
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiPropertyOptional({
    description: 'Alias IP addresses within the subnet range',
    type: [String],
    example: ['10.0.1.11', '10.0.1.12'],
  })
  @IsOptional()
  @IsArray()
  @IsIP('4', { each: true })
  aliasIps?: string[];
}

export class DetachServerFromSubnetDto {
  @ApiProperty({
    description: 'Server ID (provider resource ID) to detach from the subnet',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  serverId: string;
}
