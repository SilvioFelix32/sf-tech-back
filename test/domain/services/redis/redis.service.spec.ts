import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('RedisService', () => {
  let redisService: RedisService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
    redisMock = redisService.getClient() as jest.Mocked<Redis>;

    redisMock.quit = jest.fn().mockResolvedValue(true);
  });

  afterEach(async () => {
    await redisMock.quit();
    redisMock.disconnect();
    jest.resetAllMocks();
  });

  it('Should create a Redis instance', () => {
    expect(redisService.getClient()).toBeDefined();
  });

  // it('Should log successful connection', () => {
  //   const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

  //   redisService.getClient().connect();

  //   expect(consoleInfoSpy).toHaveBeenCalledWith(
  //     'RedisService: Successfully connected to Redis',
  //   );

  //   consoleInfoSpy.mockRestore();
  // });

  it('Should call connectWithRetry when instance is null', () => {
    redisService['instance'] = null;

    const connectWithRetrySpy = jest.spyOn(
      redisService as any,
      'connectWithRetry',
    );

    redisService.getClient();
    expect(connectWithRetrySpy).toHaveBeenCalled();
    redisService.getClient().quit();
  });

  // TODO: this test is keeping a open connection, need to find a way to close it
  // it('Should implement retry strategy correctly', async () => {
  //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  //   redisService['instance'] = null;

  //   redisMock.connect = jest.fn().mockImplementation(() => {
  //     throw new Error('Connection failed');
  //   });
  //   for (let i = 1; i <= 3; i++) {
  //     try {
  //       redisService.getClient();
  //     } catch (err) {
  //       const error = err as Error;
  //       if (i >= 3) {
  //         expect(error).toBeInstanceOf(InternalServerErrorException);
  //         expect(error.message).toBe(
  //           'RedisService: Could not connect to Redis after multiple attempts.',
  //         );
  //         expect(consoleErrorSpy).toHaveBeenCalledWith(
  //           `RedisService: Exceeded max retry attempts (${i})`,
  //         );
  //       }
  //     }
  //   }

  //   redisService.getClient().quit();
  //   redisService.getClient().disconnect();
  //   redisMock.quit();
  //   consoleErrorSpy.mockRestore();
  // });
});
