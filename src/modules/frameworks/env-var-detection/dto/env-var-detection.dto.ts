import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EnvVarSource,
  PlaceholderPattern,
} from '../../framework-core/enums/env-var-source.enum';
import { FrameworkType } from '../../framework-core/enums/framework-type.enum';

export class DetectedEnvVarDto {
  @ApiProperty({
    description: 'Environment variable name',
    example: 'DATABASE_URL',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Suggested default value (pre-fills the wizard UI field)',
    example: 'postgres://localhost:5432/mydb',
  })
  defaultValue?: string;

  @ApiProperty({
    description:
      'When true, should be stored as a Kubernetes Secret (base64). When false, ConfigMap.',
    example: true,
  })
  sensitive: boolean;

  @ApiProperty({
    description:
      'When true, the app can start without this variable configured.',
    example: false,
  })
  optional: boolean;

  @ApiPropertyOptional({
    description: 'Human-readable hint shown in the wizard UI',
    example: 'Connection string for the primary PostgreSQL database',
  })
  description?: string;

  @ApiProperty({
    enum: EnvVarSource,
    description: 'Which file/strategy produced this variable',
    example: EnvVarSource.ENV_EXAMPLE,
  })
  source: EnvVarSource;

  @ApiPropertyOptional({
    description:
      'When true, the value is hardcoded in Dockerfile — display only, do not ask user to configure.',
    example: false,
  })
  readOnly?: boolean;
}

export class EnvVarCandidateDto {
  @ApiProperty({
    type: [DetectedEnvVarDto],
    description: 'Variables detected from this source file',
  })
  vars: DetectedEnvVarDto[];

  @ApiProperty({
    description: 'Relative path of the source file used for detection',
    example: '.env.example',
  })
  sourceFile: string;

  @ApiPropertyOptional({
    enum: PlaceholderPattern,
    description:
      'Placeholder syntax detected in the source file (for YAML/JSON/Properties files)',
    example: PlaceholderPattern.DOLLAR_BRACE,
    // Stable identifiers for codegen — `${...}` and `#{...}#` cannot be derived
    // into valid JS identifiers automatically, so we name every member explicitly.
    // `x-enumNames` is preserved by @nestjs/swagger and copied to `x-enum-varnames`
    // for OpenAPI Generator by the document transformer in main.ts.
    'x-enumNames': [
      'DollarBraces', // ${...}
      'HashBraces', // #{...}#
      'Underscore', // __VAR__
      'AspNet', // <%VAR%>
      'Mustache', // {{VAR}}
      'At', // @VAR@
    ],
  })
  detectedPattern?: PlaceholderPattern;

  @ApiPropertyOptional({
    enum: FrameworkType,
    description:
      'Set when the source file pattern belongs to a framework different from the detected one. ' +
      'Informational only — never overrides the main detection result.',
    example: FrameworkType.GO,
  })
  sourceFrameworkHint?: FrameworkType;
}

export class EnvVarDetectionResultDto {
  @ApiProperty({
    type: [EnvVarCandidateDto],
    description:
      'All matching config files found, ranked by priority. ' +
      'First entry is the recommended default. ' +
      'Priority 1 (flui.env) and Priority 4a (Dockerfile) produce exactly one candidate. ' +
      'Priority 3 (framework config files) can produce multiple — the UI lets the user pick.',
  })
  candidates: EnvVarCandidateDto[];

  @ApiProperty({
    description:
      'When true, no dedicated env source was found and variables were extracted from a base ' +
      'config file. The UI should display a "list may be incomplete" warning.',
    example: false,
  })
  isFallback: boolean;
}
