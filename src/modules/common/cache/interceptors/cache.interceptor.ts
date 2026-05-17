import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  CACHEABLE_METADATA_KEY,
  CacheableOptions,
} from '../decorators/cacheable.decorator';
import { CacheService } from '../cache.service';

/**
 * Interceptor to handle caching based on @Cacheable decorator
 * Also respects skipCache query parameter
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheableOptions = this.reflector.get<CacheableOptions>(
      CACHEABLE_METADATA_KEY,
      context.getHandler(),
    );

    // If method is not marked as cacheable, skip caching
    if (!cacheableOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const skipCache =
      request.query?.skipCache === 'true' || request.query?.skipCache === true;

    // Build cache key from method name and arguments
    const methodName = context.getHandler().name;
    const className = context.getClass().name;
    const args = context.getArgs();

    // Extract useful parts for cache key
    const cacheKey = this.buildCacheKey(
      className,
      methodName,
      args,
      cacheableOptions,
    );

    // If skipCache is requested, bypass cache but still store result (if successful)
    if (skipCache) {
      this.logger.debug(`Cache SKIP requested for: ${cacheKey}`);
      return next.handle().pipe(
        tap(async (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;

          // Only cache successful responses (2xx)
          if (statusCode >= 200 && statusCode < 300) {
            await this.cacheService.set(cacheKey, data, {
              category: cacheableOptions.category,
              ttl: cacheableOptions.ttl,
            });
          } else {
            this.logger.debug(
              `NOT caching error response (${statusCode}): ${cacheKey}`,
            );
          }
        }),
        catchError((error) => {
          // Don't cache errors
          this.logger.debug(`NOT caching error: ${cacheKey}`);
          return throwError(() => error);
        }),
      );
    }

    // Try to get from cache
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData !== undefined && cachedData !== null) {
      this.logger.debug(`Returning cached data for: ${cacheKey}`);
      return new Observable((observer) => {
        observer.next(cachedData);
        observer.complete();
      });
    }

    // Cache miss - execute method and store result (only if successful)
    return next.handle().pipe(
      tap(async (data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // Only cache successful responses (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          await this.cacheService.set(cacheKey, data, {
            category: cacheableOptions.category,
            ttl: cacheableOptions.ttl,
          });
          this.logger.debug(`Cached successful response: ${cacheKey}`);
        } else {
          this.logger.debug(
            `NOT caching error response (${statusCode}): ${cacheKey}`,
          );
        }
      }),
      catchError((error) => {
        // Don't cache errors (4xx, 5xx)
        this.logger.debug(`NOT caching error response: ${cacheKey}`);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Build a cache key from context
   */
  private buildCacheKey(
    className: string,
    methodName: string,
    args: any[],
    options: CacheableOptions,
  ): string {
    // If custom key template is provided, use it
    if (options.keyTemplate) {
      return this.interpolateKeyTemplate(options.keyTemplate, args);
    }

    // Default key format: className:methodName:arg0:arg1...
    const parts = [className.toLowerCase(), methodName.toLowerCase()];

    // Include arguments in key if enabled (default: true)
    if (options.includeArgs !== false && args.length > 0) {
      // Extract meaningful arguments (skip ExecutionContext and other framework objects)
      const meaningfulArgs = this.extractMeaningfulArgs(args);
      parts.push(...meaningfulArgs);
    }

    return this.cacheService.buildKey(...parts);
  }

  /**
   * Extract meaningful arguments for cache key
   * Filters out NestJS framework objects like Request, Response, etc.
   */
  private extractMeaningfulArgs(args: any[]): string[] {
    return args
      .filter((arg) => {
        // Filter out complex objects and keep primitives/simple objects
        if (arg === null || arg === undefined) return false;
        if (typeof arg === 'function') return false;
        if (arg.constructor?.name === 'ExecutionContextHost') return false;
        if (arg.constructor?.name === 'IncomingMessage') return false;
        return true;
      })
      .map((arg) => {
        if (typeof arg === 'object') {
          // For objects, try to extract meaningful identifiers
          return arg.id || arg.provider || arg.userId || JSON.stringify(arg);
        }
        return String(arg);
      })
      .filter((str) => str && str.length < 200); // Avoid huge keys
  }

  /**
   * Interpolate key template with argument values
   * Example: "provider:{provider}:instances:{userId}" -> "provider:hetzner:instances:user123"
   */
  private interpolateKeyTemplate(template: string, args: any[]): string {
    let key = template;

    // Replace {arg0}, {arg1}, etc.
    args.forEach((arg, index) => {
      const placeholder = `{arg${index}}`;
      if (key.includes(placeholder)) {
        const value =
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        key = key.replace(placeholder, value);
      }
    });

    // Replace object property placeholders like {provider}, {userId}, etc.
    args.forEach((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        Object.keys(arg).forEach((prop) => {
          const placeholder = `{${prop}}`;
          if (key.includes(placeholder)) {
            key = key.replace(placeholder, String(arg[prop]));
          }
        });
      }
    });

    return key;
  }
}
