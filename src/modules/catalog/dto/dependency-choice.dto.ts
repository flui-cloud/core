import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DependencyMode } from '../enums/dependency-mode.enum';

export class DependencyChoiceDto {
  @ApiProperty({
    description: 'Matches spec.dependencies[].as in the manifest',
  })
  @IsString()
  alias: string;

  @ApiProperty({ enum: DependencyMode })
  @IsEnum(DependencyMode)
  mode: DependencyMode;

  @ApiPropertyOptional({
    description:
      'Required when mode=REUSE_EXISTING. ApplicationEntity id of the existing building block to reuse.',
  })
  @IsOptional()
  @IsUUID()
  existingApplicationId?: string;
}
