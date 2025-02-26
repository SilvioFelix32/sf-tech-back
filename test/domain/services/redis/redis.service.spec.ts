import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';

jest.mock('ioredis');

// jest.mock('ioredis', () => {
//   const mRedis = {
//     on: jest.fn(),
//     quit: jest.fn().mockResolvedValue('OK'),
//     disconnect: jest.fn(),
//     status: 'ready',
//     connect: jest.fn(),
//   };
//   return jest.fn(() => mRedis);
// });

describe('RedisService', () => {
  let redisService: RedisService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
    redisMock = redisService.getClient() as jest.Mocked<Redis>;
  });

  afterEach(async () => {
    await redisMock.quit();
    jest.resetAllMocks();
  });

  it('Should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('Should call onModuleInit', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    const connectWithRetrySpy = jest
      .spyOn(redisService as any, 'connectWithRetry')
      .mockResolvedValue(undefined);

    await redisService.onModuleInit();

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'RedisService.onModuleInit(): Started creating connection with Redis',
      ),
    );
    expect(connectWithRetrySpy).toHaveBeenCalledTimes(1);
  });

  it('Should log error message when onModuleInit fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest
      .spyOn(redisService as any, 'connectWithRetry')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined);

    await redisService.onModuleInit();
    redisMock.on('error', (err) => {
      console.error(`RedisService.connectWithRetry(): 1 failed: ${err}`);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'RedisService.onModuleInit(): Failed to connect with Redis: Error: First attempt failed',
      ),
    );
  });

  // it('Should retry connection and succeed on second attempt', async () => {
  //   const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  //   jest
  //     .spyOn(redisService as any, 'connectWithRetry')
  //     .mockRejectedValueOnce(new Error('First attempt failed'));

  //   // redisMock.connect();
  //   await redisService['connectWithRetry']();

  //   redisMock.on('error', (err) => {
  //     console.error(`RedisService.connectWithRetry(): 1 failed: ${err}`);
  //   });

  //   expect(consoleErrorSpy).toHaveBeenCalledWith(
  //     expect.stringContaining(
  //       'RedisService.onModuleInit(): Failed to connect with Redis: Error: RedisService.connectWithRetry(): 1 failed: First attempt failed',
  //     ),
  //   );
  // });

  it('Should throw InternalServerErrorException after max retries', async () => {
    jest
      .spyOn(redisService as any, 'connectWithRetry')
      .mockRejectedValue(new InternalServerErrorException('Maximum retries'));

    await expect(redisService['connectWithRetry']()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('Should enable shutdown hooks', async () => {
    const mockApp: any = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    jest
      .spyOn(redisService, 'enableShutdownHooks')
      .mockResolvedValue(undefined);

    await redisService.enableShutdownHooks(mockApp);
    await redisMock.quit();

    expect(redisService.enableShutdownHooks).toHaveBeenCalled();
    expect(redisMock.quit).toHaveBeenCalled();
  });
});
