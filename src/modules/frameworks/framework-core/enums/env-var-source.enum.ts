export enum EnvVarSource {
  FLUI_ENV = 'flui.env',
  ENV_EXAMPLE = '.env.example',
  DOCKERFILE = 'dockerfile',
  FRAMEWORK_CONFIG = 'framework-config',
  FALLBACK = 'fallback',
}

export enum PlaceholderPattern {
  DOLLAR_BRACE = '${...}',
  HASH_BRACE = '#{...}#',
  DOUBLE_UNDER = '__VAR__',
  ANGLE_PERCENT = '<%VAR%>',
  DOUBLE_BRACE = '{{VAR}}',
  AT_SIGN = '@VAR@',
}
