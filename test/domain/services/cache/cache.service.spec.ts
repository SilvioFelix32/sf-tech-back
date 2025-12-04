import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../../../src/domain/services/cache/cache.service';
import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { Logger } from '../../../../src/shared/logger/logger.service';

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              get: jest.fn(),
              set: jest.fn(),
              del: jest.fn(),
            }),
          },
        },
        {
          provide: ErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redisService = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCache', () => {
    it('Should get a cache', async () => {
      const result = { key: 'value' };
      const key = 'test-key';
      const mockGet = redisService.getClient().get as jest.Mock;
      mockGet.mockResolvedValue(JSON.stringify(result));

      const cachedData = await service.getCache(key);
      expect(cachedData).toEqual(result);
      expect(mockGet).toHaveBeenCalledWith(key);
    });

    it('Should return null if cache does not exist', async () => {
      const key = 'test-key';
      const mockGet = redisService.getClient().get as jest.Mock;
      mockGet.mockResolvedValue(null);

      const cachedData = await service.getCache(key);
      expect(cachedData).toBeNull();
      expect(mockGet).toHaveBeenCalledWith(key);
    });

    it('Should handle errors and return null', async () => {
      const key = 'test-key';
      const mockGet = redisService.getClient().get as jest.Mock;
      mockGet.mockRejectedValue(new Error('Redis error'));

      const cachedData = await service.getCache(key);
      expect(cachedData).toBeNull();
      expect(mockGet).toHaveBeenCalledWith(key);
    });
  });

  describe('setCache', () => {
    it('Should create a cache', async () => {
      const key = 'test-key';
      const data = { key: 'value' };
      const ttl = 3600;
      const mockSet = redisService.getClient().set as jest.Mock;
      mockSet.mockResolvedValue('OK');

      const result = await service.setCache(key, data, ttl);
      expect(result).toEqual(`Cache created for key: ${key}`);
      expect(mockSet).toHaveBeenCalledWith(
        key,
        JSON.stringify(data),
        'EX',
        ttl,
      );
    });

    it('Should throw an error if cache service fails', async () => {
      const key = 'test-key';
      const data = { key: 'value' };
      const ttl = 3600;
      const mockSet = redisService.getClient().set as jest.Mock;
      mockSet.mockRejectedValue(new Error('Redis error'));

      await expect(service.setCache(key, data, ttl)).rejects.toThrow(
        'Error setting cache',
      );
      expect(mockSet).toHaveBeenCalledWith(
        key,
        JSON.stringify(data),
        'EX',
        ttl,
      );
    });
  });

  describe('invalidateCache', () => {
    it('Should invalidate a cache', async () => {
      const key = 'test-key';
      const mockDel = redisService.getClient().del as jest.Mock;
      mockDel.mockResolvedValue(1);

      await service.invalidateCache(key);
      expect(mockDel).toHaveBeenCalledWith(key);
    });

    it('Should handle errors gracefully when invalidating cache', async () => {
      const key = 'test-key';
      const mockDel = redisService.getClient().del as jest.Mock;
      mockDel.mockRejectedValue(new Error('Redis error'));

      await expect(service.invalidateCache(key)).resolves.not.toThrow();
      expect(mockDel).toHaveBeenCalledWith(key);
    });
  });
});
