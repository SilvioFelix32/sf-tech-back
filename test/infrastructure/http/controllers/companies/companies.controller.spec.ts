import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../../../../../src/infrastructure/http/controllers/companies/companies.controller';
import { CompaniesService } from '../../../../../src/domain/services/companies/companies.service';
import { faker } from '@faker-js/faker';

const mockCompaniesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const dto = {
  company_id: faker.string.uuid(),
  name: faker.company.name(),
  fantasyName: faker.company.name(),
  email: faker.internet.email(),
  urlBanner: faker.internet.url(),
};

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    companiesService = module.get<CompaniesService>(CompaniesService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Should create a company', async () => {
      await controller.create(dto);

      expect(companiesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('Should return all companies', async () => {
      await controller.findAll();

      expect(companiesService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('Should return a company', async () => {
      await controller.findOne(dto.company_id);

      expect(companiesService.findOne).toHaveBeenCalledWith(dto.company_id);
    });
  });

  describe('update', () => {
    it('Should update a company', async () => {
      await controller.update(dto.company_id, dto);

      expect(companiesService.update).toHaveBeenCalledWith(dto.company_id, dto);
    });
  });

  describe('remove', () => {
    it('Should delete a company', async () => {
      await controller.remove(dto.company_id);

      expect(companiesService.remove).toHaveBeenCalledWith(dto.company_id);
    });
  });
});
