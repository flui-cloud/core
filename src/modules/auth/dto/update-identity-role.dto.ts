import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IdentityRole } from '../entities/user.entity';

export class UpdateIdentityRoleDto {
  @ApiProperty({ enum: IdentityRole })
  @IsEnum(IdentityRole)
  role: IdentityRole;
}
