// File: src/modules/infrastructure/servers/dto/delete-server.dto.ts

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudProvider } from 'src/modules/providers/enums/cloud-provider.enum';

export class DeleteServerDto {
  @ApiProperty({ description: 'Server ID to delete' })
  @IsNotEmpty()
  @IsString()
  server_id: string;

  @ApiProperty({ enum: CloudProvider, description: 'Cloud provider' })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiPropertyOptional({
    description: 'Force deletion even if server is running',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @ApiPropertyOptional({
    description: 'Keep Pulumi project directory after deletion',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  keep_project?: boolean;

  @ApiPropertyOptional({ description: 'Reason for deletion (for audit)' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class DeleteServerResponseDto {
  @ApiProperty({ description: 'Operation ID for tracking deletion progress' })
  operation_id: string;

  @ApiProperty({ enum: ['pending', 'running', 'completed', 'failed'] })
  status: 'pending' | 'running' | 'completed' | 'failed';

  @ApiProperty({ description: 'Resource type being deleted' })
  resource_type: 'server';

  @ApiProperty({ enum: CloudProvider, description: 'Cloud provider' })
  provider: CloudProvider;

  @ApiProperty({ description: 'Server ID being deleted' })
  resource_id: string;

  @ApiProperty({ description: 'Estimated time for deletion' })
  estimated_duration: string;

  @ApiProperty({ description: 'Deletion initiated timestamp' })
  created_at: Date;
}
