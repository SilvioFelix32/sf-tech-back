import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../../../src/domain/services/sales/sales.service';
import { CreateSaleDto } from '../../../../src/application/dtos/sales/create-sale.dto';
import { faker } from '@faker-js/faker';

const createSaleDto = {
  company_id: faker.string.uuid(),
  sale_id: faker.string.uuid(),
  total: 100,
  user_id: faker.string.uuid(),
} as CreateSaleDto;

describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesService],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Should create a sale', () => {
      expect(service.create(createSaleDto)).toBe('This action adds a new sale');
    });
  });

  describe('findAll', () => {
    it('Should return all sales', () => {
      expect(service.findAll()).toBe('This action returns all sales');
    });
  });

  describe('findOne', () => {
    it('Should find a sale by id', () => {
      expect(service.findOne(1)).toBe('This action returns a #1 sale');
    });
  });

  describe('update', () => {
    it('Should update a sale', () => {
      expect(service.update(1, createSaleDto)).toBe(
        'This action updates a #1 sale',
      );
    });
  });

  describe('remove', () => {
    it('Should remove a sale', () => {
      expect(service.remove(1)).toBe('This action removes a #1 sale');
    });
  });
});
