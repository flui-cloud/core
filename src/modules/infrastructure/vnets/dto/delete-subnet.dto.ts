import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteSubnetDto {
  @ApiProperty({
    description: 'Subnet ID (provider resource ID)',
    example: '123456',
  })
  @IsString()
  subnetId: string;
}
