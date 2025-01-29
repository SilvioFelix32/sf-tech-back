import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../../../src/domain/services/cache/cache.service';
import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';

const mockCacheService = {
  getCache: jest.fn(),
  setCache: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockErrorHandler = {
  handle: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;
  let redisService: RedisService;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redisService = module.get<RedisService>(RedisService);
    errorHandler = module.get<ErrorHandler>(ErrorHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCache', () => {
    it('Should get a cache', async () => {
      const result = { key: 'value' };
      jest.spyOn(redisService, 'get').mockResolvedValue(JSON.stringify(result));
      jest.spyOn(service, 'getCache').mockResolvedValue(result);

      expect(await service.getCache('key')).toEqual(result);
    });

    it('Should return null if cache does not exist', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(service, 'getCache').mockResolvedValue(null);

      expect(await service.getCache('key')).toEqual(null);
    });

    it('Should return null if cache service fails', async () => {
      jest.spyOn(redisService, 'get').mockRejectedValue(new Error());
      jest.spyOn(service, 'getCache').mockResolvedValue(null);

      expect(await service.getCache('key')).toEqual(null);
    });
  });

  describe('setCache', () => {
    const cacheKey = 'key';
    const cacheValue = { key: 'value' };
    const cacheTTL = 3600;
    it('Should create a cache', async () => {
      jest.spyOn(redisService, 'set').mockResolvedValue(null);
      jest
        .spyOn(service, 'setCache')
        .mockResolvedValue(`Cache created for key: ${cacheKey}`);

      expect(await service.setCache(cacheKey, cacheValue, cacheTTL)).toEqual(
        `Cache created for key: ${cacheKey}`,
      );
    });

    it('Should throw an error if cache service fails', async () => {
      jest
        .spyOn(redisService, 'set')
        .mockRejectedValue(new Error('Error setting cache'));
      jest
        .spyOn(service, 'setCache')
        .mockRejectedValue(new Error('Error setting cache'));

      await expect(
        service.setCache(cacheKey, cacheValue, cacheTTL),
      ).rejects.toThrow('Error setting cache');
    });
  });
});
