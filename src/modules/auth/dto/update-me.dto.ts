import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UserProfileDto {
  @ApiPropertyOptional() id: string;
  @ApiPropertyOptional() email: string;
  @ApiPropertyOptional() name: string;
  @ApiPropertyOptional() isAdmin: boolean;
}
