/**
 * Cache category enum to define TTL policies for different types of data
 */
export enum CacheCategory {
  /**
   * Configuration data (node sizes, pricing, regions)
   * TTL: 24 hours (86400 seconds)
   * These are static or rarely changing data from cloud providers
   */
  CONFIGURATION = 'CONFIGURATION',

  /**
   * Operational data (instances, servers, SSH keys)
   * TTL: 1 hour (3600 seconds)
   * These can be invalidated when resources are created/deleted
   */
  OPERATIONAL = 'OPERATIONAL',

  /**
   * Real-time data (server status, server details)
   * TTL: 30 seconds
   * These should be as fresh as possible
   */
  REALTIME = 'REALTIME',

  /**
   * Registry metadata (image existence, manifest digests)
   * TTL: 24 hours (86400 seconds)
   * Container registry images are immutable once published
   */
  REGISTRY_METADATA = 'REGISTRY_METADATA',
}

/**
 * Default TTL values in seconds for each cache category
 */
export const CACHE_TTL_BY_CATEGORY: Record<CacheCategory, number> = {
  [CacheCategory.CONFIGURATION]: 86400, // 24 hours
  [CacheCategory.OPERATIONAL]: 3600, // 1 hour
  [CacheCategory.REALTIME]: 30, // 30 seconds
  [CacheCategory.REGISTRY_METADATA]: 86400, // 24 hours
};
