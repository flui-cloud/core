import { Module, Global, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore, RedisStore } from 'cache-manager-redis-yet';
import { KeyvAdapter, createCache } from 'cache-manager';
import { Keyv } from 'keyv';
import { CacheService } from './cache.service';
import { REDIS_CACHE_STORE } from './cache.tokens';

const logger = new Logger('CacheModule');

export { REDIS_CACHE_STORE } from './cache.tokens';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CACHE_STORE,
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisStore | null> => {
        const cacheEnabled =
          configService.get<string>('CACHE_ENABLED', 'true') === 'true';
        if (!cacheEnabled) return null;

        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            reconnectStrategy: (retries: number) =>
              Math.min(retries * 200, 5000),
          },
          password: configService.get<string>('REDIS_PASSWORD'),
          database: configService.get<number>('CACHE_REDIS_DB', 1),
          ttl: configService.get<number>('CACHE_TTL_OPERATIONAL', 3600),
          keyPrefix: 'flui:cache:',
        });

        store.client.on('error', (err: Error) =>
          logger.error(`Redis cache client error: ${err.message}`),
        );

        return store;
      },
      inject: [ConfigService],
    },
    {
      provide: CACHE_MANAGER,
      useFactory: (store: RedisStore | null) => {
        if (!store) return createCache();
        const keyv = new Keyv({ store: new KeyvAdapter(store) });
        return createCache({ stores: [keyv] });
      },
      inject: [REDIS_CACHE_STORE],
    },
    CacheService,
  ],
  exports: [CacheService, CACHE_MANAGER, REDIS_CACHE_STORE],
})
export class CacheModule {}
