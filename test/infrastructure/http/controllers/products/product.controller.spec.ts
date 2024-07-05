import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../../src/domain/services/products/product.service';
import { ProductController } from '../../../../../src/infrasctructure/http/controllers/products/product.controller';
import { PrismaService } from '../../../../../src/domain/services/prisma/prisma.service';
import { CategoryService } from '../../../../../src/domain/services/categories/category.service';
import { RedisService } from '../../../../../src/domain/services/redis/redis.service';

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
  let categoryService: CategoryService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
