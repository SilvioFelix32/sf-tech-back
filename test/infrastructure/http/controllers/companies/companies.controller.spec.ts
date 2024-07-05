import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../../../../../src/infrasctructure/http/controllers/companies/companies.controller';
import { CompaniesService } from '../../../../../src/domain/services/companies/companies.service';
import { PrismaService } from '../../../../../src/domain/services/prisma/prisma.service';

const mockPrismaService = {
  company: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
describe('CompaniesController', () => {
  let controller: CompaniesController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
