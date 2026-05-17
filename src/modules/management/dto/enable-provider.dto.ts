import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class EnableProviderDto {
  @ApiProperty({
    description: 'Whether to enable or disable the provider',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;
}
