import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdvisorChoiceOptionDto {
  @ApiProperty({ description: 'Human-readable label shown in UI' })
  label: string;

  @ApiProperty({ description: 'Value to use as command/path' })
  value: string;
}

export class AdvisorUserChoiceDto {
  @ApiProperty({
    description: 'Which field this choice affects',
    example: 'startCommand',
  })
  field: string;

  @ApiProperty({
    description: 'Human-readable description of the ambiguity',
    example: 'Multiple start scripts detected',
  })
  description: string;

  @ApiProperty({ type: [AdvisorChoiceOptionDto] })
  options: AdvisorChoiceOptionDto[];

  @ApiProperty({ description: 'Index of the recommended option' })
  suggestedIndex: number;
}

export class BuildAdvisorResultDto {
  @ApiProperty({
    description: 'Build strategy chosen by the advisor',
    example: 'railpack_direct',
  })
  deployStrategy: string;

  @ApiProperty({
    description: 'Composite deployability score (0.0–1.0)',
    example: 0.88,
  })
  deployabilityScore: number;

  @ApiProperty({
    description:
      'Whether the user must confirm choices before triggering a build',
  })
  requiresUserConfirmation: boolean;

  @ApiProperty({
    type: [AdvisorUserChoiceDto],
    description:
      'Ambiguous choices to resolve — empty when requiresUserConfirmation is false',
  })
  userChoicesRequired: AdvisorUserChoiceDto[];

  @ApiPropertyOptional({
    description: 'Suggested build command (e.g. ./mvnw -DskipTests -B package)',
  })
  suggestedBuildCommand?: string;

  @ApiPropertyOptional({
    description: 'Suggested start/run command (e.g. node dist/main.js)',
  })
  suggestedStartCommand?: string;

  @ApiProperty({ type: [String], description: 'Warnings from the advisor' })
  projectWarnings: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Structural changes recommended to improve deployability',
  })
  recommendedStructure?: string[];

  @ApiProperty({
    description: 'Origin of this advisor result',
    enum: ['flui_yaml', 'detector', 'fallback'],
  })
  source: 'flui_yaml' | 'detector' | 'fallback';
}
