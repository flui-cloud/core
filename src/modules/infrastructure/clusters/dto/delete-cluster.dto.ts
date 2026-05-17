import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteClusterDto {
  @ApiPropertyOptional({
    description: 'Force deletion even if validation fails',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}
