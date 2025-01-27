import { ErrorHandler } from 'src/shared/errors/error-handler';
import { RedisService } from '../redis/redis.service';

export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly errorHandler: ErrorHandler,
  ) {}

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await this.redisService.get(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.log('Error getting cache', error);
      return null;
    }
  }

  async setCache<T>(key: string, data: T, ttl: number): Promise<string> {
    try {
      console.log(`Setting cache for key: ${key}`);
      await this.redisService.set(key, JSON.stringify(data), 'EX', ttl);
      return `Cache created for key: ${key}`;
    } catch (error) {
      this.errorHandler.handle(error as Error);
    }
  }
}
