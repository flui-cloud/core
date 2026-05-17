/**
 * Supported framework types for deployment
 */
export enum FrameworkType {
  // Passthrough - use existing Dockerfile
  DOCKERFILE = 'dockerfile',

  // JavaScript/TypeScript Frameworks
  NEXTJS = 'nextjs',
  ANGULAR = 'angular',
  NESTJS = 'nestjs',
  REACT_ROUTER = 'react-router',
  REMIX = 'remix',
  NUXT = 'nuxt',
  SVELTE_KIT = 'svelte-kit',
  REACT_VITE = 'react-vite',
  ASTRO = 'astro',
  VUE_VITE = 'vue-vite',
  TANSTACK_START = 'tanstack-start',
  EXPRESS = 'express',

  // Python Frameworks
  FASTHTML = 'fasthtml',
  FASTAPI = 'fastapi',
  DJANGO = 'django',
  FLASK = 'flask',

  // Java Frameworks
  SPRING_BOOT = 'spring-boot',

  // Ruby Frameworks
  RAILS = 'rails',

  // PHP Frameworks
  LARAVEL = 'laravel',

  // .NET Frameworks
  ASPNET_CORE = 'aspnet-core',

  // Elixir Frameworks
  PHOENIX = 'phoenix',

  // Go
  GO = 'go',

  // Static Sites
  STATIC_HTML = 'static-html',

  // Generic/Fallback
  GENERIC_NODE = 'generic-node',
  GENERIC_PYTHON = 'generic-python',
  UNKNOWN = 'unknown',
}
