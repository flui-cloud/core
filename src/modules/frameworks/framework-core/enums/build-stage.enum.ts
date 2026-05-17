/**
 * Docker build stages
 */
export enum BuildStage {
  DEPENDENCIES = 'dependencies',
  BUILD = 'build',
  RUNTIME = 'runtime',
  CUSTOM = 'custom',
}

/**
 * Build mode for frameworks that support multiple output modes
 */
export enum BuildMode {
  // Next.js modes
  SSR = 'ssr',
  STATIC = 'static',
  STANDALONE = 'standalone',

  // Angular modes
  SPA = 'spa',
  SSR_ANGULAR = 'ssr-angular',

  // Generic modes
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}
