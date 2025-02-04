import { InternalServerErrorException } from '@nestjs/common';
import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import Redis from 'ioredis';

jest.mock('ioredis');

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
    redisMock.emit('error', new Error('Connection failed'));

    try {
      redisService.getClient().connect();
    } catch (err) {
      const error = err as Error;
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('RedisService: Could not connect to Redis.');
    }
  });
});
