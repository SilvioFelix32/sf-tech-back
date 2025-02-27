import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../../src/domain/services/products/product.service';
import { ProductController } from '../../../../../src/infrasctructure/http/controllers/products/product.controller';
import { faker } from '@faker-js/faker';
import { IHeaders } from '../../../../../src/infrasctructure/types/IHeaders';
import { BadRequestException } from '@nestjs/common';

const mockProductService = {
  create: jest.fn(),
  findAll: jest.fn(),
  search: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const dto = {
  company_id: faker.string.uuid(),
  category_id: faker.string.uuid(),
  sku: faker.string.uuid(),
  title: faker.commerce.productName(),
  subtitle: faker.commerce.productDescription(),
  description: faker.commerce.productDescription(),
  urlBanner: faker.internet.url(),
  price: faker.number.int(),
  discount: faker.number.int(),
  highlighted: faker.datatype.boolean(),
  active: faker.datatype.boolean(),
};

const headers = {
  company_id: dto.company_id,
  category_id: dto.category_id,
} as IHeaders;

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Should create a product', async () => {
      await controller.create(headers, dto);

      expect(productService.create).toHaveBeenCalledWith(dto.category_id, dto);
    });

    it('Should create a product with a default urlBanner', async () => {
      const dtoWithoutBanner = { ...dto, urlBanner: undefined };

      await controller.create(headers, dtoWithoutBanner);

      expect(productService.create).toHaveBeenCalledWith(headers.category_id, {
        ...dtoWithoutBanner,
        urlBanner: 'https://i.imgur.com/2HFGvvT.png',
      });
    });

    it('Should throw BadRequestException if company_id is missing', async () => {
      expect(() => controller.create({} as IHeaders, dto)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    const query = { page: 1, limit: 10 };

    it('Should return a list of products', async () => {
      await controller.findAll(query);

      expect(productService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('search', () => {
    const query = 'product';

    it('Should return a list of products', async () => {
      await controller.search(query);

      expect(productService.search).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('Should return a product', async () => {
      await controller.findOne(dto.category_id);

      expect(productService.findOne).toHaveBeenCalledWith(dto.category_id);
    });
  });

  describe('update', () => {
    it('Should update a product', async () => {
      await controller.update(headers, dto.category_id, dto);

      expect(productService.update).toHaveBeenCalledWith(dto.category_id, dto);
    });

    it('Should throw BadRequestException if company_id is missing', () => {
      expect(() => controller.update({} as IHeaders, '1', {})).toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('Should delete a product', async () => {
      await controller.remove(dto.category_id);

      expect(productService.remove).toHaveBeenCalledWith(dto.category_id);
    });
  });
});
