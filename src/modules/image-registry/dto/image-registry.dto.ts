import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ImageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() appId: string;
  @ApiProperty() imageRef: string;
  @ApiProperty() commitSha: string;
  @ApiProperty() branch: string;
  @ApiPropertyOptional() githubPackageId?: string;
  @ApiPropertyOptional() sizeBytes?: number;
  @ApiProperty({ type: [String] }) fluiTags: string[];
  @ApiProperty() isCurrentlyDeployed: boolean;
  @ApiProperty() createdAt: Date;
}

export class ListImagesQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() appId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class AddFluiTagDto {
  @ApiProperty({
    description: 'Tag to add (e.g. "production", "stable", "v1.2.0")',
  })
  @IsString()
  tag: string;
}

export class DeployImageDto {
  @ApiPropertyOptional({
    description: 'Optional reason for deploying this image',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
