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
import { RedisService } from '../../../../src/domain/services/redis/redis.service';

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

describe('ProductService', () => {
  let service: ProductService;
  let categoryService: CategoryService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
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

    it('should create a product', async () => {
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
      ).toEqual(result);
    });

    it('should throw an error if product creation fails', async () => {
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

    it('should throw an InternalServerErrorException if product there is no category_id', async () => {
      jest
        .spyOn(prismaService.product, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Error creating product'),
        );

      await expect(
        service.create(
          createProductDto.category_id as string,
          createProductDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return products from cache if available', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValue(JSON.stringify(cachedDataResponse.data));
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockResolvedValue(dbData.data);

      expect(await service.findAll({ page: 1, limit: 10 })).toEqual(
        cachedDataResponse,
      );
    });

    it('should return products from database if cache is not available', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockResolvedValue(dbDataResponse.data.data as Product[]);
      jest.spyOn(redisService, 'set').mockResolvedValue(null);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(dbDataResponse);
      expect(redisService.get).toHaveBeenCalledWith('product');
    });

    it('should throw an internal server error if database query fails', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
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
    it('should search products by title', async () => {
      const result = [{ product_id: '1', title: 'Test Product' }] as Product[];

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(result);

      expect(await service.search('Test')).toEqual(result);
    });

    it('should throw an error if search fails', async () => {
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockRejectedValue(
          new InternalServerErrorException('Error searching products'),
        );

      await expect(service.search('Test')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a product by id', async () => {
      const result = { product_id: '1', title: 'Test Product' } as Product;

      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);

      expect(await service.findOne('1')).toEqual(result);
    });

    it('should throw an error if product is not found', async () => {
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw an InternalServerErrorException', async () => {
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
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
      const result = { product_id: '1', ...updateProductDto } as Product;

      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(prismaService.product, 'update').mockResolvedValue(result);

      expect(await service.update('1', updateProductDto)).toEqual(result);
    });

    it('should throw an error if product update fails', async () => {
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
    it('should delete a product', async () => {
      const result = { product_id: '1', title: 'Test Product' } as Product;
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);
      jest.spyOn(prismaService.product, 'delete').mockResolvedValue(result);

      expect(await service.remove('1')).toEqual(result);
    });

    it('should throw an error if product deletion fails', async () => {
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
