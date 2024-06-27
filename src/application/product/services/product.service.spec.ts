import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../../shared/infraestructure/prisma/prisma.service';
import { RedisService } from '../../../shared/infraestructure/cache/redis';
import { PaginatedResult, createPaginator } from 'prisma-pagination';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Product, ProductCategory } from '@prisma/client';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { faker } from '@faker-js/faker';
import { FindProductDto } from '../dto/find-product.dto';

jest.mock('prisma-pagination', () => ({
  createPaginator: jest.fn(),
}));

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

describe.only('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
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
        await service.create(createProductDto.category_id, createProductDto),
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
        service.create(createProductDto.category_id, createProductDto),
      ).rejects.toThrow();
    });

    it('should throw an InternalServerErrorException if product there is no category_id', async () => {
      jest
        .spyOn(prismaService.product, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Error creating product'),
        );

      await expect(
        service.create(createProductDto.category_id, createProductDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    const cachedData = {
      data: [
        {
          category_id: faker.string.uuid(),
          product_id: faker.string.uuid(),
          title: 'Test Product',
        },
      ] as Product[],
      timestamp: Math.floor(Date.now() / 1000),
    };
    it('should return products from cache if available', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValue(JSON.stringify(cachedData));
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockResolvedValue(cachedData.data);

      expect(await service.findAll({ page: 1, limit: 10 })).toEqual(
        cachedData.data,
      );
    });

    // it('should return products from database if cache is not available', async () => {
    //   const dbData = { data: [{ product_id: faker.string.uuid(), title: 'Test Product' }] as Product[] };

    //   jest.spyOn(redisService, 'get').mockResolvedValue(null);
    //   jest.spyOn(redisService, 'set').mockResolvedValue(null);
    //   jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(dbData.data as unknown as PaginatedResult<Product>);

    //   const result = await service.findAll({ page: 1, limit: 10 });

    //   expect(result).toEqual(dbData);
    //   expect(redisService.get).toHaveBeenCalledWith('product');
    //   expect(redisService.set).toHaveBeenCalledWith('product', JSON.stringify(dbData), 60);
    // });

    it('should throw an internal server error if database query fails', async () => {
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

  // describe('search', () => {
  //   it('should search products by title', async () => {
  //     const result: Product[] = [{ product_id: '1', title: 'Test Product' }];

  //     jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(result);

  //     expect(await service.search('Test')).toEqual(result);
  //   });

  //   it('should throw an error if search fails', async () => {
  //     jest.spyOn(prismaService.product, 'findMany').mockRejectedValue(new Error());

  //     await expect(service.search('Test')).rejects.toThrow(InternalServerErrorException);
  //   });
  // });

  // describe('findOne', () => {
  //   it('should find a product by id', async () => {
  //     const result: Product = { product_id: '1', title: 'Test Product' };

  //     jest.spyOn(service, 'validateProduct').mockResolvedValue(result);
  //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(result);

  //     expect(await service.findOne('1')).toEqual(result);
  //   });

  //   it('should throw an error if product is not found', async () => {
  //     jest.spyOn(service, 'validateProduct').mockResolvedValue(null);
  //     jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(null);

  //     await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  //   });
  // });

  // describe('update', () => {
  //   it('should update a product', async () => {
  //     const updateProductDto: UpdateProductDto = { title: 'Updated Product' };
  //     const result: Product = { product_id: '1', ...updateProductDto };

  //     jest.spyOn(service, 'validateProduct').mockResolvedValue(true);
  //     jest.spyOn(prismaService.product, 'update').mockResolvedValue(result);

  //     expect(await service.update('1', updateProductDto)).toEqual(result);
  //   });

  //   it('should throw an error if product update fails', async () => {
  //     const updateProductDto: UpdateProductDto = { title: 'Updated Product' };

  //     jest.spyOn(service, 'validateProduct').mockResolvedValue(true);
  //     jest.spyOn(prismaService.product, 'update').mockRejectedValue(new Error());

  //     await expect(service.update('1', updateProductDto)).rejects.toThrow(InternalServerErrorException);
  //   });
  // });

  // describe('remove', () => {
  //   it('should delete a product', async () => {
  //     const result: Product = { product_id: '1', title: 'Test Product' };

  //     jest.spyOn(service, 'validateProduct').mockResolvedValue(true);
  //     jest.spyOn(prismaService.product, 'delete').mockResolvedValue(result);

  //     expect(await service.remove('1')).toEqual(result);
  //   });

  //   it('should throw an error if product deletion fails', async () => {
  //     jest.spyOn(service, 'validateProduct').mockResolvedValue(true);
  //     jest.spyOn(prismaService.product, 'delete').mockRejectedValue(new Error());

  //     await expect(service.remove('1')).rejects.toThrow(InternalServerErrorException);
  //   });
  // });
});
