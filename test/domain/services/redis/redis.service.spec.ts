import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { faker } from '@faker-js/faker';

describe('RedisService', () => {
  let redisService: RedisService;

  process.env.REDIS_HOST = faker.internet.ip();
  process.env.REDIS_USER = faker.internet.username();
  process.env.REDIS_PASSWORD = faker.internet.password();

  beforeAll(() => {
    redisService = new RedisService();
  });

  afterAll(async () => {
    await redisService.quit();
  });

  it('should connect to Redis', async () => {
    jest.spyOn(redisService, 'ping').mockResolvedValue('PONG');

    await expect(redisService.ping()).resolves.toBe('PONG');
  });

  it('should handle connection errors', async () => {
    jest
      .spyOn(redisService, 'ping')
      .mockRejectedValue(new Error('Connection failed'));

    await expect(redisService.ping()).rejects.toThrow('Connection failed');
  });
});
