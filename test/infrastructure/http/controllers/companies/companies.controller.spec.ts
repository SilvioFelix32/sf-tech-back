import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../../../../../src/infrasctructure/http/controllers/companies/companies.controller';
import { CompaniesService } from '../../../../../src/domain/services/companies/companies.service';
import { PrismaService } from '../../../../../src/domain/services/prisma/prisma.service';
import { ErrorHandler } from '../../../../../src/shared/errors/error-handler';

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

const mockErrorHandler = {
  handle: jest.fn(),
};

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let prismaService: PrismaService;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    prismaService = module.get<PrismaService>(PrismaService);
    errorHandler = module.get<ErrorHandler>(ErrorHandler);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
