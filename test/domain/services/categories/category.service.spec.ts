import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Company, ProductCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CategoryService } from '../../../../src/domain/services/categories/category.service';
import { UpdateCategoryDto } from '../../../../src/application/dtos/categories/update-category.dto';
import { Category } from '../../../../src/domain/entities/categories/category.entity';
import { CompaniesService } from '../../../../src/domain/services/companies/companies.service';
import { ProductService } from '../../../../src/domain/services/products/product.service';
import { ICategoryResponse } from '../../../../src/infrasctructure/types/category-response';
import { PrismaService } from '../../../../src/domain/services/prisma/prisma.service';
import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';

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

const company_id = faker.string.uuid();
const dbData = {
  data: [
    {
      company_id,
      category_id: faker.string.uuid(),
      title: faker.lorem.word(),
      description: faker.lorem.word(),
      products: [],
    },
  ] as unknown as ProductCategory[],
};

const cachedDataResponse = {
  data: {
    data: [
      {
        company_id,
        category_id: faker.string.uuid(),
        title: faker.lorem.word(),
        description: faker.lorem.word(),
        products: [],
      },
    ],
    meta: {
      currentPage: 1,
      lastPage: 1,
      next: null,
      perPage: 10,
      prev: null,
      total: 1,
    },
  },
  message: 'Categories retrieved from cache',
} as ICategoryResponse;

const dbDataResponse = {
  data: {
    data: [
      {
        company_id,
        category_id: faker.string.uuid(),
        title: faker.lorem.word(),
        description: faker.lorem.word(),
        products: [],
      },
    ],
    meta: {
      currentPage: 1,
      lastPage: 1,
      next: null,
      perPage: 10,
      prev: null,
      total: 1,
    },
  },
  message: 'Categories retrieved from database',
} as ICategoryResponse;

describe('CategoryService', () => {
  let service: CategoryService;
  let productService: ProductService;
  let companiesService: CompaniesService;
  let prismaService: PrismaService;
  let redisService: RedisService;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: ProductService, useValue: mockProductService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
    companiesService = module.get<CompaniesService>(CompaniesService);
    productService = module.get<ProductService>(ProductService);
    errorHandler = module.get<ErrorHandler>(ErrorHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = {
      category_id: faker.string.uuid(),
      company_id: faker.string.uuid(),
      title: 'Test Category',
      description: 'Test Description',
      products: [],
    };

    const result = createCategoryDto as Category;

    it('should create a category', async () => {
      jest
        .spyOn(prismaService.productCategory, 'create')
        .mockResolvedValue(result as ProductCategory);

      expect(
        await service.create(
          createCategoryDto.company_id as string,
          createCategoryDto,
        ),
      ).toEqual(`Category ${result.category_id} created successfully`);
    });

    it('should throw an error if category creation fails', async () => {
      jest
        .spyOn(prismaService.productCategory, 'create')
        .mockRejectedValue(new Error());

      await expect(
        service.create(
          createCategoryDto.company_id as string,
          createCategoryDto,
        ),
      ).rejects.toThrow();
    });

    it('should throw an InternalServerErrorException if category there is no category_id', async () => {
      jest
        .spyOn(prismaService.productCategory, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Error creating product'),
        );

      // jest.spyOn(errorHandler, 'handle').mockImplementation((error: Error) => {
      //   throw new InternalServerErrorException('Error creating product');
      // });

      await expect(
        service.create(
          createCategoryDto.category_id as string,
          createCategoryDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
      // expect(errorHandler.handle).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('findAll', () => {
    it('should return categories from cache if available', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue({
        company_id,
        name: 'Test Company',
      } as Company);
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValue(JSON.stringify(cachedDataResponse.data));
      jest
        .spyOn(prismaService.productCategory, 'findMany')
        .mockResolvedValue(dbData.data);

      expect(
        await service.findAll(company_id, {
          page: 1,
          limit: 10,
        }),
      ).toEqual(cachedDataResponse);
    });

    it('should return categories from database if cache is not available', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue({
        company_id,
        name: 'Test Company',
      } as Company);
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest
        .spyOn(prismaService.productCategory, 'findMany')
        .mockResolvedValue(dbDataResponse.data.data as ProductCategory[]);
      jest.spyOn(redisService, 'set').mockResolvedValue(null);

      const result = await service.findAll(company_id, {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(dbDataResponse);
      expect(redisService.get).toHaveBeenCalledWith('category');
    });

    it('should throw an internal server error if database query fails', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue({
        company_id,
        name: 'Test Company',
      } as Company);
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest
        .spyOn(prismaService.productCategory, 'findMany')
        .mockRejectedValue(
          new InternalServerErrorException('Error retrieving products'),
        );

      await expect(
        service.findAll(company_id, { page: 1, limit: 10 }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should find a category by id', async () => {
      const result = {
        category_id: '1',
        title: 'Test category',
      } as ProductCategory;

      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
    });

    it('should throw an error if category is not found', async () => {
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw an InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockRejectedValue(
          new InternalServerErrorException('Error finding category'),
        );

      await expect(service.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateCategoryDto = {
        title: 'Updated Product',
      };

      const result = {
        category_id: '1',
        company_id: '1',
        ...updateProductDto,
      } as ProductCategory;

      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue(result);
      jest
        .spyOn(prismaService.productCategory, 'update')
        .mockResolvedValue(result);

      expect(await service.update('1', updateProductDto)).toEqual(
        `Category ${result.category_id} updated successfully`,
      );
    });

    it('should throw an error if product update fails', async () => {
      const updateProductDto: UpdateCategoryDto = { title: 'Updated Category' };
      jest
        .spyOn(prismaService.productCategory, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Error updating category'),
        );

      await expect(service.update('1', updateProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const result = {
        category_id: '1',
        title: 'Test Category',
      } as ProductCategory;
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue(result);
      jest
        .spyOn(prismaService.productCategory, 'delete')
        .mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(
        `Category ${result.category_id} deleted successfully`,
      );
    });

    it('should throw an error if product deletion fails', async () => {
      jest
        .spyOn(prismaService.productCategory, 'delete')
        .mockRejectedValue(
          new InternalServerErrorException('Error deleting product'),
        );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
