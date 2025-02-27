import { RedisService } from '../redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await this.redisService.getClient().get(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('CacheService.getCache: Error getting cache', error);
      return null;
    }
  }

  async setCache<T>(key: string, data: T, ttl: number): Promise<string> {
    try {
      console.info(`Setting cache for key: ${key}`);
      await this.redisService
        .getClient()
        .set(key, JSON.stringify(data), 'EX', ttl);
      return `Cache created for key: ${key}`;
    } catch (error) {
      throw new Error('Error setting cache', { cause: error });
    }
  }
}
