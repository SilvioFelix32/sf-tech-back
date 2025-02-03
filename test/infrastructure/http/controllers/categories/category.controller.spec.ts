import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../../../../src/domain/services/categories/category.service';
import { CategoryController } from '../../../../../src/infrasctructure/http/controllers/categories/category.controller';
import { PrismaService } from '../../../../../src/domain/services/prisma/prisma.service';
import { CompaniesService } from '../../../../../src/domain/services/companies/companies.service';
import { ProductService } from '../../../../../src/domain/services/products/product.service';
import { RedisService } from '../../../../../src/domain/services/redis/redis.service';
import { ErrorHandler } from '../../../../../src/shared/errors/error-handler';
import { CacheService } from '../../../../../src/domain/services/cache/cache.service';

const mockPrismaService = {
  productCategory: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockCacheService = {
  getCache: jest.fn(),
  setCache: jest.fn(),
};

const mockProductService = {
  findAll: jest.fn(),
  findUnique: jest.fn(),
};

const mockCompaniesService = {
  findUnique: jest.fn(),
};

const mockErrorHandler = {
  handle: jest.fn(),
};

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: ProductService, useValue: mockProductService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });
});
