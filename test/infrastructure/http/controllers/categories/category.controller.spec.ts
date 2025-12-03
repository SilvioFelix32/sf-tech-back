import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../../../../src/domain/services/categories/category.service';
import { CategoryController } from '../../../../../src/infrastructure/http/controllers/categories/category.controller';
import { BadRequestException } from '@nestjs/common';
import { IHeaders } from '../../../../../src/infrastructure/types/IHeaders';
import { TestData } from '../../../../helpers/test-data';

const mockCategoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const dto = {
  category_id: TestData.uuid(),
  company_id: TestData.uuid(),
  title: 'Test Category',
  description: 'Test Description',
  products: [],
};

const headers = { company_id: dto.company_id } as IHeaders;

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Should create a category', async () => {
      await controller.create(headers, dto);

      expect(categoryService.create).toHaveBeenCalledWith(
        headers.company_id,
        dto,
      );
    });

    it('Should throw BadRequestException if company_id is missing', async () => {
      expect(() => controller.create({} as IHeaders, dto)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    const query = { page: 1, limit: 10 };

    it('Should return a list of categories', async () => {
      await controller.findAll(headers, query);

      expect(categoryService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('Should return a category', async () => {
      await controller.findOne(dto.category_id);

      expect(categoryService.findOne).toHaveBeenCalledWith(dto.category_id);
    });
  });

  describe('update', () => {
    it('Should update a category', async () => {
      await controller.update(headers, dto.category_id, dto);

      expect(categoryService.update).toHaveBeenCalledWith(dto.category_id, dto);
    });

    it('Should throw BadRequestException if company_id is missing', () => {
      expect(() => controller.update({} as IHeaders, '1', {})).toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('Should delete a category', async () => {
      await controller.remove(dto.category_id);

      expect(categoryService.remove).toHaveBeenCalledWith(dto.category_id);
    });
  });
});
