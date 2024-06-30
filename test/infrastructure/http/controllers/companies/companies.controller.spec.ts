import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../../../../../src/infrasctructure/http/controllers/companies/companies.controller';
import { CompaniesService } from '../../../../../src/domain/services/companies/companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [CompaniesService],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
