import { SetMetadata } from '@nestjs/common';
import { CacheCategory } from '../enums/cache-category.enum';

/**
 * Metadata key for cacheable decorator
 */
export const CACHEABLE_METADATA_KEY = 'cacheable';

/**
 * Options for @Cacheable decorator
 */
export interface CacheableOptions {
  /**
   * Cache category to determine TTL
   */
  category?: CacheCategory;

  /**
   * Custom TTL in seconds (overrides category TTL)
   */
  ttl?: number;

  /**
   * Custom cache key template
   * Can use placeholders: {userId}, {provider}, {arg0}, {arg1}, etc.
   * Example: "provider:{provider}:instances:{userId}"
   */
  keyTemplate?: string;

  /**
   * Whether to include method arguments in the cache key
   * Default: true
   */
  includeArgs?: boolean;
}

/**
 * Decorator to mark a method as cacheable
 * This is metadata only - actual caching logic is in the interceptor or manual implementation
 *
 * @example
 * ```typescript
 * @Cacheable({ category: CacheCategory.CONFIGURATION, keyTemplate: 'provider:{provider}:node-sizes' })
 * async getNodeSizes(provider: CloudProvider): Promise<NodeSizeDto[]> {
 *   // Implementation
 * }
 * ```
 */
export const Cacheable = (options?: CacheableOptions) =>
  SetMetadata(CACHEABLE_METADATA_KEY, options || {});
