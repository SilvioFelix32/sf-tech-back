import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../../../src/domain/services/sales/sales.service';

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
});
