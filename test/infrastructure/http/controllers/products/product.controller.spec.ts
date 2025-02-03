import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../../src/domain/services/products/product.service';
import { ProductController } from '../../../../../src/infrasctructure/http/controllers/products/product.controller';
import { PrismaService } from '../../../../../src/domain/services/prisma/prisma.service';
import { CategoryService } from '../../../../../src/domain/services/categories/category.service';
import { RedisService } from '../../../../../src/domain/services/redis/redis.service';
import { CacheService } from '../../../../../src/domain/services/cache/cache.service';

const mockPrismaService = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  productCategory: {
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

const mockCategoryService = {
  findAll: jest.fn(),
  findUnique: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });
});
