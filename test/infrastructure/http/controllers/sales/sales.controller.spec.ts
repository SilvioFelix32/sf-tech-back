import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../../../../src/domain/services/sales/sales.service';
import { SalesController } from '../../../../../src/infrasctructure/http/controllers/sales/sales.controller';

describe('SalesController', () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [SalesService],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });
});
