/**
 * Template registry — single source of truth for available framework templates.
 *
 * Each entry corresponds to a real GitHub template repository under the
 * `flui-cloud` organisation. Repos are tested end-to-end (docker build + run +
 * endpoint check) before being added here.
 *
 * To add a new framework or major version:
 *   1. Create the template repo on GitHub (with `# #flui-managed` Dockerfile)
 *   2. Mark it as a "Template repository" in repo settings
 *   3. Add a new entry below
 *
 * To deprecate a version: keep the entry, set isDeprecated=true.
 * To switch the default version: update isDefault flags accordingly.
 */

export type TemplateCategory = 'frontend' | 'backend' | 'fullstack' | 'static';

export type TemplateLanguage =
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'python'
  | 'csharp'
  | 'go';

export interface TemplateConfig {
  /** Stable framework identifier used in URLs and source configs */
  framework: string;
  /** Display name for the UI */
  displayName: string;
  /** Short description shown in the template list */
  description: string;
  /** Major version of the framework, e.g. '16', '4', '21' */
  version: string;
  /** GitHub repo name within the `flui-cloud` org */
  repo: string;
  /** Resolved at runtime by TemplatesService — full https URL */
  repoUrl?: string;
  /** Category for filtering in the UI */
  category: TemplateCategory;
  /** Primary language */
  language: TemplateLanguage;
  /** Default port the app listens on */
  port: number;
  /** K8s probe path */
  healthcheckPath: string;
  /** Build tool description */
  buildTool: string;
  /** Whether this is the recommended version for new projects */
  isDefault: boolean;
  /** Legacy / discouraged version */
  isDeprecated: boolean;
}

export const TEMPLATE_REGISTRY: TemplateConfig[] = [
  {
    framework: 'nextjs',
    displayName: 'Next.js',
    description:
      'React framework with App Router, Server Actions and Turbopack',
    version: '16',
    repo: 'flui-template-nextjs-16',
    category: 'fullstack',
    language: 'typescript',
    port: 3000,
    healthcheckPath: '/api/health',
    buildTool: 'npm',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'nuxt',
    displayName: 'Nuxt',
    description:
      'Vue.js meta-framework with SSR, Nitro server and auto-imports',
    version: '4',
    repo: 'flui-template-nuxt-4',
    category: 'fullstack',
    language: 'typescript',
    port: 3000,
    healthcheckPath: '/api/health',
    buildTool: 'npm',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'angular',
    displayName: 'Angular',
    description: 'Platform for building SPA applications, served via nginx',
    version: '21',
    repo: 'flui-template-angular-21',
    category: 'frontend',
    language: 'typescript',
    port: 80,
    healthcheckPath: '/health',
    buildTool: 'npm + nginx',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'sveltekit',
    displayName: 'SvelteKit',
    description: 'Full-stack Svelte 5 framework with Node adapter',
    version: '2',
    repo: 'flui-template-sveltekit-2',
    category: 'fullstack',
    language: 'typescript',
    port: 3000,
    healthcheckPath: '/api/health',
    buildTool: 'npm',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'nestjs',
    displayName: 'NestJS',
    description: 'Progressive Node.js framework with auto-generated OpenAPI',
    version: '11',
    repo: 'flui-template-nestjs-11',
    category: 'backend',
    language: 'typescript',
    port: 3000,
    healthcheckPath: '/health',
    buildTool: 'npm',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'spring-boot',
    displayName: 'Spring Boot',
    description: 'Java framework with Actuator, springdoc-openapi and Java 21',
    version: '3',
    repo: 'flui-template-spring-boot-3',
    category: 'backend',
    language: 'java',
    port: 8080,
    healthcheckPath: '/actuator/health',
    buildTool: 'Maven',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'django',
    displayName: 'Django',
    description: 'Django 5 LTS with Django REST Framework and drf-spectacular',
    version: '5',
    repo: 'flui-template-django-5',
    category: 'fullstack',
    language: 'python',
    port: 8000,
    healthcheckPath: '/health/',
    buildTool: 'pip + gunicorn',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'fastapi',
    displayName: 'FastAPI',
    description: 'High-performance Python API framework with native OpenAPI',
    version: '0',
    repo: 'flui-template-fastapi',
    category: 'backend',
    language: 'python',
    port: 8000,
    healthcheckPath: '/health',
    buildTool: 'pip + uvicorn',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'aspnet-core',
    displayName: 'ASP.NET Core',
    description: '.NET 10 LTS Minimal API with Swashbuckle and OpenAPI',
    version: '10',
    repo: 'flui-template-aspnet-core-10',
    category: 'backend',
    language: 'csharp',
    port: 8080,
    healthcheckPath: '/health',
    buildTool: 'dotnet',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'generic',
    displayName: 'Generic',
    description:
      'Blank starter for any runtime (Node.js HTTP server by default)',
    version: '1',
    repo: 'flui-template-generic',
    category: 'backend',
    language: 'javascript',
    port: 3000,
    healthcheckPath: '/health',
    buildTool: '-',
    isDefault: true,
    isDeprecated: false,
  },
  {
    framework: 'astro',
    displayName: 'Astro',
    description:
      'Fast, content-focused static site framework with zero JS by default',
    version: '5',
    repo: 'flui-template-astro-5',
    category: 'static',
    language: 'typescript',
    port: 80,
    healthcheckPath: '/health',
    buildTool: 'npm + nginx',
    isDefault: true,
    isDeprecated: false,
  },
];

/**
 * Find a template by framework identifier, optionally pinning a major version.
 *
 * - `version` omitted: returns the entry with `isDefault: true` (excluding
 *   deprecated ones). Falls back to the latest non-deprecated entry if no
 *   default is flagged.
 * - `version` provided: returns the exact (framework, version) match,
 *   regardless of `isDefault` / `isDeprecated`.
 */
export function findTemplate(
  framework: string,
  version?: string,
): TemplateConfig | undefined {
  if (version) {
    return TEMPLATE_REGISTRY.find(
      (t) => t.framework === framework && t.version === version,
    );
  }

  const byDefault = TEMPLATE_REGISTRY.find(
    (t) => t.framework === framework && t.isDefault && !t.isDeprecated,
  );
  if (byDefault) {
    return byDefault;
  }

  const nonDeprecated = TEMPLATE_REGISTRY.filter(
    (t) => t.framework === framework && !t.isDeprecated,
  );
  return nonDeprecated.at(-1);
}

export function listFrameworkVersions(framework: string): string[] {
  return TEMPLATE_REGISTRY.filter((t) => t.framework === framework).map(
    (t) => t.version,
  );
}
