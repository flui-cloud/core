import { Logger } from '@nestjs/common';
import { ApplicationKind } from '../../applications/enums/application-kind.enum';

const logger = new Logger('CatalogCategoryToKind');

const CATEGORY_TO_KIND: Record<string, ApplicationKind> = {
  database: ApplicationKind.DATABASE,
  cache: ApplicationKind.DATABASE,
  'database-tools': ApplicationKind.TOOL,
  'developer-tools': ApplicationKind.TOOL,
  dashboards: ApplicationKind.TOOL,
  monitoring: ApplicationKind.TOOL,
  'document-management': ApplicationKind.TOOL,
  productivity: ApplicationKind.APPLICATION,
  cms: ApplicationKind.APPLICATION,
  'backend-as-a-service': ApplicationKind.APPLICATION,
  storage: ApplicationKind.APPLICATION,
  security: ApplicationKind.APPLICATION,
  search: ApplicationKind.APPLICATION,
};

export function mapCatalogCategoryToKind(
  category: string | undefined | null,
): ApplicationKind {
  if (!category) {
    return ApplicationKind.APPLICATION;
  }
  const normalized = category.trim().toLowerCase();
  const mapped = CATEGORY_TO_KIND[normalized];
  if (!mapped) {
    logger.warn(
      `Unknown catalog category "${category}", defaulting to APPLICATION`,
    );
    return ApplicationKind.APPLICATION;
  }
  return mapped;
}
