import { RedisService } from '../redis/redis.service';
import { Injectable } from '@nestjs/common';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {}

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await this.redisService.getClient().get(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      this.logger.error(
        `CacheService.getCache() - Error getting cache for key: ${key}`,
        { error: error instanceof Error ? error : new Error(String(error)) },
      );
      return null;
    }
  }

  async setCache<T>(key: string, data: T, ttl: number): Promise<string> {
    try {
      this.logger.info(
        `CacheService.setCache() - Setting cache for key: ${key}`,
        { metadata: { key, ttl } },
      );
      await this.redisService
        .getClient()
        .set(key, JSON.stringify(data), 'EX', ttl);
      this.logger.info(
        `CacheService.setCache() - Cache created successfully for key: ${key}`,
        { metadata: { key, ttl } },
      );
      return `Cache created for key: ${key}`;
    } catch (error) {
      this.logger.error(
        `CacheService.setCache() - Error setting cache for key: ${key}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { key, ttl },
        },
      );
      throw new Error('Error setting cache', { cause: error });
    }
  }
}
