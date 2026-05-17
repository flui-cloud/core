export interface TemplateContext {
  app: TemplateAppContext;
  env: Record<string, string>;
  components?: Record<string, TemplateComponentContext>;
  deps?: Record<string, TemplateDependencyContext>;
}

export interface TemplateAppContext {
  id: string;
  slug: string;
  domain?: string;
  namespace: string;
}

export interface TemplateComponentContext {
  host: string;
  env: Record<string, string>;
}

export interface TemplateDependencyContext {
  host: string;
  port?: number;
  env: Record<string, string>;
}
