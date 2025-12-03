import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Company, ProductCategory } from '@prisma/client';
import { TestData } from '../../../helpers/test-data';
import { CategoryService } from '../../../../src/domain/services/categories/category.service';
import { UpdateCategoryDto } from '../../../../src/application/dtos/categories/update-category.dto';
import { Category } from '../../../../src/domain/entities/categories/category.entity';
import { CompaniesService } from '../../../../src/domain/services/companies/companies.service';
import { ProductService } from '../../../../src/domain/services/products/product.service';
import { ICategoryResponse } from '../../../../src/infrastructure/types/category-response';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { CacheService } from '../../../../src/domain/services/cache/cache.service';
import { Logger } from '../../../../src/shared/logger/logger.service';

const mockDatabaseService = {
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

const mockcacheService = {
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

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

const company_id = TestData.uuid();
const dbData = {
  data: [
    {
      company_id,
      category_id: TestData.uuid(),
      title: TestData.word(),
      description: TestData.sentence(),
      products: [],
    },
  ] as unknown as ProductCategory[],
};

const dbDataResponse = {
  data: [
    {
      company_id,
      category_id: TestData.uuid(),
      title: TestData.word(),
      description: TestData.sentence(),
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
  message: 'Categories retrieved from database',
} as ICategoryResponse;

const cachedDataResponse = {
  ...dbDataResponse,
  message: 'Categories retrieved from cache',
} as ICategoryResponse;

describe('CategoryService', () => {
  let service: CategoryService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: CacheService, useValue: mockcacheService },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: ProductService, useValue: mockProductService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = {
      category_id: TestData.uuid(),
      company_id: TestData.uuid(),
      title: 'Test Category',
      description: 'Test Description',
      products: [],
    };

    const result = createCategoryDto as Category;

    it('Should create a category', async () => {
      jest
        .spyOn(databaseService.productCategory, 'create')
        .mockResolvedValue(result as ProductCategory);

      expect(
        await service.create(
          createCategoryDto.company_id as string,
          createCategoryDto,
        ),
      ).toEqual(`Category ${result.category_id} created successfully`);
    });

    it('Should throw an error if category creation fails', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new Error(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'create')
        .mockRejectedValue(new Error());

      await expect(
        service.create(
          createCategoryDto.company_id as string,
          createCategoryDto,
        ),
      ).rejects.toThrow();
    });

    it('Should throw an InternalServerErrorException if category there is no category_id', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Error creating product'),
        );

      await expect(
        service.create(
          createCategoryDto.category_id as string,
          createCategoryDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('Should return categories from cache if available', async () => {
      jest.spyOn(databaseService.company, 'findUnique').mockResolvedValue({
        company_id,
        name: 'Test Company',
      } as Company);
      jest
        .spyOn(cacheService, 'getCache')
        .mockResolvedValue(cachedDataResponse);
      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockResolvedValue(dbData.data);

      expect(
        await service.findAll({
          page: 1,
          limit: 10,
        }),
      ).toEqual(cachedDataResponse);
    });

    it('Should return categories from database if cache is not available', async () => {
      jest.spyOn(databaseService.company, 'findUnique').mockResolvedValue({
        company_id,
        name: 'Test Company',
      } as Company);
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      jest
          .spyOn(databaseService.productCategory, 'findMany')
        .mockResolvedValue(dbDataResponse.data as ProductCategory[]);
      jest.spyOn(cacheService, 'setCache').mockResolvedValue('Created');

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(dbDataResponse);
      expect(cacheService.getCache).toHaveBeenCalledWith('category');
    });

    it('Should throw an InternalServerErrorException if database query fails', async () => {
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockRejectedValue(
          new InternalServerErrorException('Error retrieving products'),
        );

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('Should throw an NotFoundException if no categories are found', async () => {
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockRejectedValue(new NotFoundException('Error retrieving products'));

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('Should find a category by id', async () => {
      const result = {
        category_id: '1',
        title: 'Test category',
      } as ProductCategory;

      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
    });

    it('Should throw a NotFoundException if category is not found', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('Should throw an InternalServerErrorException', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockRejectedValue(
          new InternalServerErrorException('Error finding category'),
        );

      await expect(service.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('Should update a category', async () => {
      const updateProductDto: UpdateCategoryDto = {
        title: 'Updated Product',
      };

      const result = {
        category_id: '1',
        company_id: '1',
        ...updateProductDto,
      } as ProductCategory;

      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue(result);
      jest
        .spyOn(databaseService.productCategory, 'update')
        .mockResolvedValue(result);

      expect(await service.update('1', updateProductDto)).toEqual(
        `Category ${result.category_id} updated successfully`,
      );
    });

    it('Should update a category end cache', async () => {
      const updateProductDto: UpdateCategoryDto = {
        title: 'Updated Product',
      };

      const result = {
        category_id: '1',
        company_id: '1',
        ...updateProductDto,
      } as ProductCategory;

      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue(result);
      jest
        .spyOn(databaseService.productCategory, 'update')
        .mockResolvedValue(result);

      const fetchAndCacheCategoriesSpy = jest
        .spyOn(service as any, 'fetchAndCacheCategories')
        .mockResolvedValue(undefined);

      jest.useFakeTimers();

      await service.update('1', updateProductDto);

      jest.runAllTimers();

      expect(fetchAndCacheCategoriesSpy).toHaveBeenCalledWith(
        1,
        20,
        'category',
        60 * 60 * 24,
      );

      jest.useRealTimers();
    });

    it('Should correctly paginate data inside fetchAndCacheCategories', async () => {
      const categories = Array.from({ length: 50 }, (_, i) => ({
        category_id: `${i + 1}`,
        title: `Category ${i + 1}`,
      })) as ProductCategory[];

      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockResolvedValue(categories);

      const setCacheSpy = jest
        .spyOn(cacheService, 'setCache')
        .mockResolvedValue('Created');

      const result = await (service as any).fetchAndCacheCategories(
        2,
        10,
        'category',
        86400,
      );

      expect(result.data.length).toBe(10);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.perPage).toBe(10);
      expect(result.meta.total).toBe(50);
      expect(result.meta.lastPage).toBe(5);
      expect(result.meta.prev).toBe(1);
      expect(result.meta.next).toBe(3);

      expect(setCacheSpy).toHaveBeenCalledWith(
        'category',
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ category_id: '11' }),
            expect.objectContaining({ category_id: '20' }),
          ]),
          meta: expect.objectContaining({
            currentPage: 2,
            perPage: 10,
            total: 50,
            lastPage: 5,
            prev: 1,
            next: 3,
          }),
        }),
        86400,
      );
    });

    it('Should handle empty data correctly in fetchAndCacheCategories', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockResolvedValue([]);

      const setCacheSpy = jest
        .spyOn(cacheService, 'setCache')
        .mockResolvedValue('Created');

      const result = await (service as any).fetchAndCacheCategories(
        1,
        10,
        'category',
        86400,
      );

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.lastPage).toBe(0);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.prev).toBeNull();
      expect(result.meta.next).toBeNull();

      expect(setCacheSpy).toHaveBeenCalledWith(
        'category',
        expect.objectContaining({
          data: [],
          meta: {
            total: 0,
            lastPage: 0,
            currentPage: 1,
            perPage: 10,
            prev: null,
            next: null,
          },
        }),
        86400,
      );
    });

    it('Should handle null data correctly inside fetchAndCacheCategories', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockResolvedValue(null as any);

      const result = await (service as any).fetchAndCacheCategories(
        1,
        10,
        'category',
        86400,
      );

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('Should use default perPage value if limit is not provided inside paginateData', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findMany')
        .mockResolvedValue([]);

      const result = await (service as any).fetchAndCacheCategories(
        1,
        undefined as any,
        'category',
        86400,
      );

      expect(result.meta.perPage).toBe(20);
    });

    it('Should throw an error if product update fails', async () => {
      const updateProductDto: UpdateCategoryDto = { title: 'Updated Category' };
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Error updating category'),
        );

      await expect(service.update('1', updateProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('Should delete a product', async () => {
      const result = {
        category_id: '1',
        title: 'Test Category',
      } as ProductCategory;
      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue(result);
      jest
        .spyOn(databaseService.productCategory, 'delete')
        .mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(
        `Category ${result.category_id} deleted successfully`,
      );
    });

    it('Should throw an error if product deletion fails', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.productCategory, 'delete')
        .mockRejectedValue(
          new InternalServerErrorException('Error deleting product'),
        );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
