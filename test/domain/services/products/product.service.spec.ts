import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../src/domain/services/products/product.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Product, ProductCategory } from '@prisma/client';
import { TestData } from '../../../helpers/test-data';
import { CategoryService } from '../../../../src/domain/services/categories/category.service';
import { CreateProductDto } from '../../../../src/application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../../../src/application/dtos/products/update-product.dto';
import { IProductResponse } from '../../../../src/infrastructure/types/product-response';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { CacheService } from '../../../../src/domain/services/cache/cache.service';
import { Logger } from '../../../../src/shared/logger/logger.service';

const mockDatabaseService = {
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

const mockCategoryService = {
  findAll: jest.fn(),
  findUnique: jest.fn(),
};

const dbData = {
  data: [
    {
      category_id: TestData.uuid(),
      product_id: TestData.uuid(),
      title: 'Test Product',
    },
  ] as unknown as Product[],
};

const dbDataResponse = {
  data: [
    {
      category_id: TestData.uuid(),
      product_id: TestData.uuid(),
      title: 'Test Product',
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
  message: 'Products retrieved from database',
} as IProductResponse;

const cachedDataResponse = {
  ...dbDataResponse,
  message: 'Products retrieved from cache',
} as IProductResponse;

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

describe('ProductService', () => {
  let service: ProductService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      category_id: TestData.uuid(),
      title: 'Test Product',
    } as CreateProductDto;

    const result = {
      product_id: TestData.uuid(),
      ...createProductDto,
    } as Product;

    it('Should create a product', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue({
          category_id: createProductDto.category_id,
        } as ProductCategory);
      jest.spyOn(databaseService.product, 'create').mockResolvedValue(result);

      expect(
        await service.create(
          createProductDto.category_id as string,
          createProductDto,
        ),
      ).toEqual(`Product ${result.product_id} created successfully`);
    });

    it('Should throw an error if product creation fails', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue({
          category_id: createProductDto.category_id,
        } as ProductCategory);
      jest
        .spyOn(databaseService.product, 'create')
        .mockRejectedValue(new Error());

      mockErrorHandler.handle.mockImplementation((error) => {
        return error instanceof Error ? error : new Error(String(error));
      });

      await expect(
        service.create(
          createProductDto.category_id as string,
          createProductDto,
        ),
      ).rejects.toThrow();
    });

    it('Should throw an NotFoundException if product there is no category_id', async () => {
      jest
        .spyOn(databaseService.productCategory, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });

      await expect(
        service.create(createProductDto.category_id, createProductDto),
      ).rejects.toThrow(NotFoundException);
      expect(databaseService.productCategory.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('Should return products from cache if available', async () => {
      jest
        .spyOn(cacheService, 'getCache')
        .mockResolvedValue(cachedDataResponse);
      jest
        .spyOn(databaseService.product, 'findMany')
        .mockResolvedValue(dbData.data);

      expect(await service.findAll({ page: 1, limit: 10 })).toEqual(
        cachedDataResponse,
      );
    });

    it('Should return products from database if cache is not available', async () => {
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      jest
        .spyOn(databaseService.product, 'findMany')
        .mockResolvedValue(dbDataResponse.data as Product[]);
      jest.spyOn(cacheService, 'setCache').mockResolvedValue('Created');

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(dbDataResponse);
      expect(cacheService.getCache).toHaveBeenCalledWith('product');
    });

    it('Should throw an internal server error if database query fails', async () => {
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.product, 'findMany')
        .mockRejectedValue(
          new InternalServerErrorException('Error retrieving products'),
        );

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('search', () => {
    it('Should search products by title', async () => {
      const result = [{ product_id: '1', title: 'Test Product' }] as Product[];

      jest.spyOn(databaseService.product, 'findMany').mockResolvedValue(result);

      expect(await service.search('Test')).toEqual(result);
    });

    it('Should throw an error if search fails', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });
      jest
        .spyOn(databaseService.product, 'findMany')
        .mockRejectedValue(new NotFoundException('No products found'));

      await expect(service.search('Test')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('Should find a product by id', async () => {
      const result = { product_id: '1', title: 'Test Product' } as Product;

      jest.spyOn(databaseService.product, 'findUnique').mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
    });

    it('Should throw an error if product is not found', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });
      jest.spyOn(databaseService.product, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('Should throw an InternalServerErrorException', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.product, 'findUnique')
        .mockRejectedValue(
          new InternalServerErrorException('Error finding product'),
        );

      await expect(service.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('Should update a product', async () => {
      const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
      const result = { product_id: '1', ...updateProductDto } as Product;

      jest.spyOn(databaseService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(databaseService.product, 'update').mockResolvedValue(result);

      expect(await service.update('1', updateProductDto)).toEqual(
        `Product ${result.product_id} updated successfully`,
      );
    });

    it('Should update a product and cache', async () => {
      const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
      const result = { product_id: '1', ...updateProductDto } as Product;

      jest.spyOn(databaseService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(databaseService.product, 'update').mockResolvedValue(result);

      const fetchAndCacheProductsSpy = jest
        .spyOn(service as any, 'fetchAndCacheProducts')
        .mockResolvedValue(undefined);

      jest.useFakeTimers();

      await service.update('1', updateProductDto);

      jest.runAllTimers();

      expect(fetchAndCacheProductsSpy).toHaveBeenCalledWith(
        1,
        20,
        'product',
        60 * 60 * 24,
      );

      jest.useRealTimers();
    });

    it('Should update a product and cache', async () => {
      const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
      const result = { product_id: '1', ...updateProductDto } as Product;

      jest.spyOn(databaseService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(databaseService.product, 'update').mockResolvedValue(result);

      const fetchAndCacheProductsSpy = jest
        .spyOn(service as any, 'fetchAndCacheProducts')
        .mockResolvedValue(undefined);

      jest.useFakeTimers();

      await service.update('1', updateProductDto);

      jest.runAllTimers();

      expect(fetchAndCacheProductsSpy).toHaveBeenCalledWith(
        1,
        20,
        'product',
        60 * 60 * 24,
      );

      jest.useRealTimers();
    });

    it('Should handle empty data correctly in fetchAndCacheProducts', async () => {
      jest.spyOn(databaseService.product, 'findMany').mockResolvedValue([]);

      const setCacheSpy = jest
        .spyOn(cacheService, 'setCache')
        .mockResolvedValue('Created');

      const result = await (service as any).fetchAndCacheProducts(
        1,
        10,
        'product',
        86400,
      );

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.lastPage).toBe(0);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.prev).toBeNull();
      expect(result.meta.next).toBeNull();

      expect(setCacheSpy).toHaveBeenCalledWith(
        'product',
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

    it('Should handle null data correctly inside fetchAndCacheProducts', async () => {
      jest
        .spyOn(databaseService.product, 'findMany')
        .mockResolvedValue(null as any);

      const result = await (service as any).fetchAndCacheProducts(
        1,
        10,
        'product',
        86400,
      );

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('Should use default perPage value if limit is not provided inside paginateData', async () => {
      jest.spyOn(databaseService.product, 'findMany').mockResolvedValue([]);

      const result = await (service as any).fetchAndCacheProducts(
        1,
        undefined as any,
        'product',
        86400,
      );

      expect(result.meta.perPage).toBe(20);
    });

    it('Should set prevPage to page - 1 when page > 1', async () => {
      const products = Array.from({ length: 50 }, (_, i) => ({
        product_id: `${i + 1}`,
        title: `Product ${i + 1}`,
      })) as Product[];

      jest.spyOn(databaseService.product, 'findMany').mockResolvedValue(products);

      const result = await (service as any).fetchAndCacheProducts(
        2,
        10,
        'product',
        86400,
      );

      expect(result.meta.prev).toBe(1); // page = 2, prevPage = 1
    });

    it('Should set prevPage to null when page <= 1', async () => {
      const products = Array.from({ length: 50 }, (_, i) => ({
        product_id: `${i + 1}`,
        title: `Product ${i + 1}`,
      })) as Product[];

      jest.spyOn(databaseService.product, 'findMany').mockResolvedValue(products);

      const result = await (service as any).fetchAndCacheProducts(
        1,
        10,
        'product',
        86400,
      );

      expect(result.meta.prev).toBeNull(); // page = 1, prevPage = null
    });

    it('Should set nextPage to page + 1 when page < totalPages', async () => {
      const products = Array.from({ length: 50 }, (_, i) => ({
        product_id: `${i + 1}`,
        title: `Product ${i + 1}`,
      })) as Product[];

      jest.spyOn(databaseService.product, 'findMany').mockResolvedValue(products);

      const result = await (service as any).fetchAndCacheProducts(
        2,
        10,
        'product',
        86400,
      );

      expect(result.meta.next).toBe(3); // page = 2, nextPage = 3
    });

    it('Should throw an error if product update fails', async () => {
      const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.product, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Error updating product'),
        );

      await expect(service.update('1', updateProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('Should delete a product', async () => {
      const result = { product_id: '1', title: 'Test Product' } as Product;
      jest.spyOn(databaseService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(databaseService.product, 'delete').mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(
        `Product ${result.product_id} deleted successfully`,
      );
    });

    it('Should throw an error if product deletion fails', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.product, 'delete')
        .mockRejectedValue(
          new InternalServerErrorException('Error deleting product'),
        );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
