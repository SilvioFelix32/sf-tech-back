import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../../../src/domain/services/sales/sales.service';
import { faker } from '@faker-js/faker';

const saleDto = {
  company_id: faker.string.uuid(),
  sale_id: faker.string.uuid(),
  total: 100,
  user_id: faker.string.uuid(),
};

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
      expect(service.create(saleDto)).toBe('This action adds a new sale');
    });
  });

  describe('findAll', () => {
    it('Should return all sales', () => {
      expect(service.findAll()).toBe('This action returns all sales');
    });
  });

  describe('findOne', () => {
    it('Should find a sale by id', () => {
      expect(service.findOne(saleDto.sale_id)).toBe(
        `This action returns a #${saleDto.sale_id} sale`,
      );
    });
  });

  describe('update', () => {
    it('Should update a sale', () => {
      expect(service.update(saleDto.sale_id, saleDto)).toBe(
        `This action updates a #${saleDto.sale_id} sale`,
      );
    });
  });

  describe('remove', () => {
    it('Should remove a sale', () => {
      expect(service.remove(saleDto.sale_id)).toBe(
        `This action removes a #${saleDto.sale_id} sale`,
      );
    });
  });
});
