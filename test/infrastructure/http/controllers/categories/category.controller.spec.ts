import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../../../../src/domain/services/categories/category.service';
import { CategoryController } from '../../../../../src/infrasctructure/http/controllers/categories/category.controller';

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
