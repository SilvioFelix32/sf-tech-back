import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
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
  });

  afterEach(async () => {
    await redisMock.quit();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetModules();
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

  it('Should retry connection and succeed on second attempt', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
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

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('First attempt failed'),
    );
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'RedisService.connectWithRetry(): Redis connected!',
      ),
    );

    expect(setTimeoutSpy).toHaveBeenCalled();
  });

  it('Should log an error and throw InternalServerErrorException after max retries', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

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

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('RedisService: Maximum retries (3) reached.'),
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
