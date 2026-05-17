import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AsyncOperationResponseDto } from 'src/modules/common/dto';

export class AddWorkerDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 5,
    description:
      'Number of worker nodes to add. Capped at 5 per call to bound provisioning load.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  count?: number;
}

export class AddWorkerResponseDto extends AsyncOperationResponseDto {}
