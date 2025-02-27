import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../../../../src/domain/services/sales/sales.service';
import { SalesController } from '../../../../../src/infrasctructure/http/controllers/sales/sales.controller';
import { faker } from '@faker-js/faker';

const mockSalesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const dto = {
  sale_id: faker.string.uuid(),
  company_id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  total: faker.number.int(),
};

describe('SalesController', () => {
  let controller: SalesController;
  let salesService: SalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    salesService = module.get<SalesService>(SalesService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Should create a sale', () => {
      controller.create(dto);

      expect(salesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('Should return all sales', () => {
      controller.findAll();

      expect(salesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('Should return a sale', () => {
      controller.findOne(dto.sale_id);

      expect(salesService.findOne).toHaveBeenCalledWith(dto.sale_id);
    });
  });

  describe('update', () => {
    it('Should update a sale', () => {
      controller.update(dto.sale_id, dto);

      expect(salesService.update).toHaveBeenCalledWith(dto.sale_id, dto);
    });
  });

  describe('remove', () => {
    it('Should delete a sale', () => {
      controller.remove(dto.sale_id);

      expect(salesService.remove).toHaveBeenCalledWith(dto.sale_id);
    });
  });
});
