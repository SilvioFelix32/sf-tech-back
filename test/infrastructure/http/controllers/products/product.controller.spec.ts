import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../../../../src/domain/services/products/product.service';
import { ProductController } from '../../../../../src/infrasctructure/http/controllers/products/product.controller';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
