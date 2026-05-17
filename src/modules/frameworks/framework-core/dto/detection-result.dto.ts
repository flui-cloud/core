import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrameworkType, BuildMode } from '../enums';

export class DetectionResultDto {
  @ApiProperty({ enum: FrameworkType })
  framework: FrameworkType;

  @ApiProperty({
    description: 'Confidence score 0-100',
    minimum: 0,
    maximum: 100,
  })
  confidence: number;

  @ApiPropertyOptional({ description: 'Detected framework version' })
  version?: string;

  @ApiPropertyOptional({ description: 'Major version for template selection' })
  majorVersion?: string;

  @ApiPropertyOptional({ enum: BuildMode })
  buildMode?: BuildMode;

  @ApiPropertyOptional({ type: [String], description: 'Detected features' })
  features?: string[];

  @ApiPropertyOptional({ enum: ['npm', 'yarn', 'pnpm', 'bun'] })
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  @ApiPropertyOptional({ description: 'Node.js version requirement' })
  nodeVersion?: string;

  @ApiPropertyOptional({ type: [String], description: 'Warnings' })
  warnings?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Validation errors' })
  validationErrors?: string[];

  @ApiProperty({ description: 'Detector that produced this result' })
  detectorName: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, any>;
}
