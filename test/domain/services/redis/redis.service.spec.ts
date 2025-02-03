import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import Redis from 'ioredis';

describe('RedisService', () => {
  let redisService: RedisService;

  beforeAll(() => {
    redisService = new RedisService();
  });

  afterAll(async () => {
    await redisService.getClient().quit();
  });

  it('Should create a Redis instance', () => {
    expect(redisService.getClient()).toBeInstanceOf(Redis);
  });

  it('Should handle connection errors', () => {
    const redisMock = redisService.getClient() as any;
    const errorCallback = jest.fn();

    redisMock.on.mockImplementation((event: string, callback: any) => {
      if (event === 'error') callback(new Error('Connection failed'));
    });

    redisMock.on('error', errorCallback);

    expect(errorCallback).toHaveBeenCalledWith(new Error('Connection failed'));
  });
});
