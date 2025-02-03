import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../../src/domain/services/users/users.service';
import { UsersController } from '../../../../../src/infrasctructure/http/controllers/users/users.controller';
import { PrismaService } from '../../../../../src/domain/services/prisma/prisma.service';
import { CacheService } from '../../../../../src/domain/services/cache/cache.service';
import { RedisService } from '../../../../../src/domain/services/redis/redis.service';
import { ErrorHandler } from '../../../../../src/shared/errors/error-handler';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
};

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

describe('UsersController', () => {
  let controller: UsersController;
  let cacheService: CacheService;
  let redisService: RedisService;
  let prismaService: PrismaService;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
    redisService = module.get<RedisService>(RedisService);
    errorHandler = module.get<ErrorHandler>(ErrorHandler);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });
});
