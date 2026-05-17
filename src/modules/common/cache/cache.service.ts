import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-yet';
import {
  CacheCategory,
  CACHE_TTL_BY_CATEGORY,
} from './enums/cache-category.enum';
import { REDIS_CACHE_STORE } from './cache.tokens';

/**
 * Options for cache operations
 */
export interface CacheOptions {
  category?: CacheCategory;
  ttl?: number;
  key?: string;
  /**
   * Function to validate if the value should be cached
   * Return false to skip caching (e.g., for error responses)
   */
  shouldCache?: (value: any) => boolean;
}

/**
 * Centralized cache service that wraps cache-manager with custom logic
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Optional()
    @Inject(REDIS_CACHE_STORE)
    private readonly redisStore: RedisStore | null,
  ) {}

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value !== undefined && value !== null) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error.message);
      return undefined;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttlSeconds = this.resolveTTL(options);
      const ttlMilliseconds = ttlSeconds * 1000; // cache-manager v7 with Redis uses milliseconds
      await this.cacheManager.set(key, value, ttlMilliseconds);
      this.logger.debug(
        `Cache SET: ${key} (TTL: ${ttlSeconds}s = ${ttlMilliseconds}ms)`,
      );
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete a specific cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DELETE: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DELETE error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete cache keys matching a pattern (e.g., "provider:hetzner:*")
   * Note: This requires Redis store with pattern matching support
   */
  // The Redis key prefix configured in cache.module.ts
  private static readonly KEY_PREFIX = 'flui:cache:';

  async deletePattern(pattern: string): Promise<void> {
    if (!this.redisStore) {
      this.logger.warn(
        `Redis cache store not available, cannot delete pattern: ${pattern}`,
      );
      return;
    }

    try {
      const fullPattern = `${CacheService.KEY_PREFIX}${pattern}`;
      const client = this.redisStore.client;
      const keys: string[] = [];
      for await (const key of client.scanIterator({
        MATCH: fullPattern,
        COUNT: 200,
      })) {
        keys.push(...(Array.isArray(key) ? key : [key]));
      }
      if (keys.length > 0) {
        await client.del(keys);
      }
      this.logger.debug(
        `Cache DELETE PATTERN: ${pattern} (${keys.length} keys deleted)`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Cache DELETE PATTERN error for ${pattern}: ${msg}`);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // In cache-manager v7, use store.reset() instead
      const store: any = (this.cacheManager as any).store;
      if (store?.reset) {
        await store.reset();
        this.logger.log('Cache RESET: All cache cleared');
      } else {
        this.logger.warn('Cache reset not supported by this store');
      }
    } catch (error) {
      this.logger.error('Cache RESET error:', error.message);
    }
  }

  /**
   * Wrap a function with caching logic
   * If skipCache is true, always fetch fresh data
   */
  async wrap<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions & { skipCache?: boolean },
  ): Promise<T> {
    // If skipCache is true, bypass cache and fetch fresh data
    if (options?.skipCache) {
      this.logger.debug(`Cache SKIP: ${key} (forced refresh)`);
      const value = await factory();

      // Validate if value should be cached
      const shouldCache = options?.shouldCache
        ? options.shouldCache(value)
        : true;

      if (shouldCache) {
        await this.set(key, value, options);
      } else {
        this.logger.debug(`NOT caching value (failed validation): ${key}`);
      }

      return value;
    }

    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    // Cache miss, fetch fresh data
    const value = await factory();

    // Validate if value should be cached
    const shouldCache = options?.shouldCache
      ? options.shouldCache(value)
      : true;

    if (shouldCache) {
      await this.set(key, value, options);
    } else {
      this.logger.debug(`NOT caching value (failed validation): ${key}`);
    }

    return value;
  }

  /**
   * Build a cache key with consistent format
   */
  buildKey(...parts: (string | number)[]): string {
    return parts.filter((p) => p !== undefined && p !== null).join(':');
  }

  /**
   * Helper to determine if a response should be cached
   * Returns false for error responses (4xx, 5xx) or responses with errors
   *
   * @param value - The value to validate
   * @returns true if value should be cached, false otherwise
   *
   * @example
   * ```typescript
   * cacheService.wrap(key, factory, {
   *   shouldCache: CacheService.shouldCacheResponse
   * });
   * ```
   */
  static shouldCacheResponse(value: any): boolean {
    // Don't cache null or undefined
    if (value === null || value === undefined) {
      return false;
    }

    // If the response contains an errors array with items, don't cache
    if (
      value?.errors &&
      Array.isArray(value.errors) &&
      value.errors.length > 0
    ) {
      return false;
    }

    // If the response has an error property (boolean), don't cache
    if (value?.error === true) {
      return false;
    }

    // If the response has a statusCode indicating an error (4xx, 5xx), don't cache
    if (value?.statusCode && value.statusCode >= 400) {
      return false;
    }

    // If the response has a status property indicating error
    if (typeof value?.status === 'number' && value.status >= 400) {
      return false;
    }

    // Default: cache the response
    return true;
  }

  /**
   * Resolve TTL from options or category
   */
  private resolveTTL(options?: CacheOptions): number {
    if (options?.ttl !== undefined) {
      return options.ttl;
    }

    if (options?.category) {
      return CACHE_TTL_BY_CATEGORY[options.category];
    }

    // Default TTL: 1 hour
    return 3600;
  }
}
