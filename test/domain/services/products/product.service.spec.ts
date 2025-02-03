import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../src/domain/services/products/product.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Product, ProductCategory } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CategoryService } from '../../../../src/domain/services/categories/category.service';
import { CreateProductDto } from '../../../../src/application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../../../src/application/dtos/products/update-product.dto';
import { IProductResponse } from '../../../../src/infrasctructure/types/product-response';
import { PrismaService } from '../../../../src/domain/services/prisma/prisma.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { CacheService } from '../../../../src/domain/services/cache/cache.service';

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

const mockCategoryService = {
  findAll: jest.fn(),
  findUnique: jest.fn(),
};

const dbData = {
  data: [
    {
      category_id: faker.string.uuid(),
      product_id: faker.string.uuid(),
      title: 'Test Product',
    },
  ] as unknown as Product[],
};

const cachedDataResponse = {
  data: {
    data: [
      {
        category_id: faker.string.uuid(),
        product_id: faker.string.uuid(),
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
  },
  message: 'Products retrieved from cache',
} as IProductResponse;

const dbDataResponse = {
  data: {
    data: [
      {
        category_id: faker.string.uuid(),
        product_id: faker.string.uuid(),
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
  },
  message: 'Products retrieved from database',
} as IProductResponse;

const mockErrorHandler = {
  handle: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      category_id: faker.string.uuid(),
      title: 'Test Product',
    } as CreateProductDto;

    const result = {
      product_id: faker.string.uuid(),
      ...createProductDto,
    } as Product;

    it('Should create a product', async () => {
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue({
          category_id: createProductDto.category_id,
        } as ProductCategory);
      jest.spyOn(prismaService.product, 'create').mockResolvedValue(result);

      expect(
        await service.create(
          createProductDto.category_id as string,
          createProductDto,
        ),
      ).toEqual(`Product ${result.product_id} created successfully`);
    });

    it('Should throw an error if product creation fails', async () => {
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue({
          category_id: createProductDto.category_id,
        } as ProductCategory);
      jest
        .spyOn(prismaService.product, 'create')
        .mockRejectedValue(new Error());

      await expect(
        service.create(
          createProductDto.category_id as string,
          createProductDto,
        ),
      ).rejects.toThrow();
    });

    it('Should throw an NotFoundException if product there is no category_id', async () => {
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValue({ category_id: '1234' } as ProductCategory)
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.create(createProductDto.category_id, createProductDto),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.productCategory.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('Should return products from cache if available', async () => {
      jest
        .spyOn(cacheService, 'getCache')
        .mockResolvedValue(cachedDataResponse.data);
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockResolvedValue(dbData.data);

      expect(await service.findAll({ page: 1, limit: 10 })).toEqual(
        cachedDataResponse,
      );
    });

    it('Should return products from database if cache is not available', async () => {
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockResolvedValue(dbDataResponse.data.data as Product[]);
      jest.spyOn(cacheService, 'setCache').mockResolvedValue('Created');

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(dbDataResponse);
      expect(cacheService.getCache).toHaveBeenCalledWith('product');
    });

    it('Should throw an internal server error if database query fails', async () => {
      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      jest
        .spyOn(prismaService.product, 'findMany')
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

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(result);

      expect(await service.search('Test')).toEqual(result);
    });

    it('Should throw an error if search fails', async () => {
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockRejectedValue(new NotFoundException('No products found'));

      await expect(service.search('Test')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('Should find a product by id', async () => {
      const result = { product_id: '1', title: 'Test Product' } as Product;

      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
    });

    it('Should throw an error if product is not found', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('Should throw an InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.product, 'findUnique')
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

      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(prismaService.product, 'update').mockResolvedValue(result);

      expect(await service.update('1', updateProductDto)).toEqual(
        `Product ${result.product_id} updated successfully`,
      );
    });

    it('Should throw an error if product update fails', async () => {
      const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
      jest
        .spyOn(prismaService.product, 'update')
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
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(prismaService.product, 'delete').mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(
        `Product ${result.product_id} deleted successfully`,
      );
    });

    it('Should throw an error if product deletion fails', async () => {
      jest
        .spyOn(prismaService.product, 'delete')
        .mockRejectedValue(
          new InternalServerErrorException('Error deleting product'),
        );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
