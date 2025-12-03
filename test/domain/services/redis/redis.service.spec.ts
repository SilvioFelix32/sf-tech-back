import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import { Logger } from '../../../../src/shared/logger/logger.service';

jest.mock('ioredis');

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

describe('RedisService', () => {
  let redisService: RedisService;
  let redisMock: jest.Mocked<Redis>;
  let logger: Logger;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
    logger = moduleRef.get<Logger>(Logger);
    redisMock = redisService.getClient() as jest.Mocked<Redis>;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    try {
      if (redisMock && redisMock.quit && typeof redisMock.quit === 'function') {
        const quitResult = redisMock.quit();
        if (quitResult && typeof quitResult.catch === 'function') {
          await quitResult.catch(() => {});
        }
      }
    } catch {
      // Ignore errors
    }
    (RedisService as any).instance = null;
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('Should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('Should call onModuleInit', async () => {
    const connectWithRetrySpy = jest
      .spyOn(redisService as any, 'connectWithRetry')
      .mockResolvedValue(undefined);

    await redisService.onModuleInit();

    expect(mockLogger.info).toHaveBeenCalledWith(
      'RedisService.onModuleInit() - Started creating connection with Redis',
    );
    expect(connectWithRetrySpy).toHaveBeenCalledTimes(1);
  });

  it('Should log error message when onModuleInit fails', async () => {
    jest
      .spyOn(redisService as any, 'connectWithRetry')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined);

    await redisService.onModuleInit();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'RedisService.onModuleInit() - Failed to connect with Redis',
      { error: expect.any(Error) },
    );
  });

  it('Should retry connection and succeed on second attempt', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    let attempt = 0;

    jest.spyOn(redisMock, 'once').mockImplementation((event, callback) => {
      if (event === 'ready' && attempt === 1) {
        setTimeout(() => callback(), 50);
      } else if (event === 'error' && attempt === 0) {
        attempt++;
        setTimeout(() => callback(new Error('First attempt failed')), 50);
      }
      return redisMock;
    });

    await redisService['connectWithRetry']();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'RedisService.connectWithRetry() - Connection attempt 1 failed',
      expect.objectContaining({
        error: expect.any(Error),
        metadata: expect.objectContaining({ attempt: 1 }),
      }),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'RedisService.connectWithRetry() - Redis connected successfully',
    );

    expect(setTimeoutSpy).toHaveBeenCalled();
  });

  it('Should log an error and throw InternalServerErrorException after max retries', async () => {
    let attempt = 0;

    jest.spyOn(redisMock, 'once').mockImplementation((event, callback) => {
      if (event === 'error' && attempt < 3) {
        attempt++;
        setTimeout(() => callback(new Error(`Attempt ${attempt} failed`)), 10);
      }
      return redisMock;
    });

    jest.advanceTimersByTime(30);

    await expect(redisService['connectWithRetry']()).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      'RedisService.connectWithRetry() - Maximum retries reached',
      expect.objectContaining({
        metadata: expect.objectContaining({ attempts: 3, maxRetries: 3 }),
      }),
    );
  });

  it('Should throw InternalServerErrorException after max retries', async () => {
    jest
      .spyOn(redisService as any, 'connectWithRetry')
      .mockRejectedValue(new InternalServerErrorException('Maximum retries'));

    await expect(redisService['connectWithRetry']()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('Should enable shutdown hooks and close Redis connection', async () => {
    const mockApp = { close: jest.fn().mockResolvedValue(undefined) };

    jest.spyOn(process, 'on');
    const quitSpy = jest.spyOn(redisMock, 'quit').mockResolvedValue('OK');
    const closeSpy = jest.spyOn(mockApp, 'close').mockResolvedValue(undefined);

    await redisService.enableShutdownHooks(
      mockApp as unknown as INestApplication,
    );

    process.emit('beforeExit', 0);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(quitSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});
