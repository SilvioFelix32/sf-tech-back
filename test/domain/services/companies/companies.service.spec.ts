import { Test, TestingModule } from '@nestjs/testing';
import { Company } from '@prisma/client';
import { TestData } from '../../../helpers/test-data';
import { CompaniesService } from '../../../../src/domain/services/companies/companies.service';
import { UpdateCompanyDto } from '../../../../src/application/dtos/company/update-company.dto';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { Logger } from '../../../../src/shared/logger/logger.service';

const mockDatabaseService = {
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

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

describe('CompaniesService', () => {
  let service: CompaniesService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    service = module.get<CompaniesService>(CompaniesService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const data = {
      company_id: TestData.uuid(),
      name: TestData.firstName(),
      fantasyName: TestData.fullName(),
      email: TestData.email(),
    };

    const result = data as Company;
    it('Should create a company', async () => {
      jest
        .spyOn(databaseService.company, 'findFirst')
        .mockResolvedValue({} as Company);
      jest
        .spyOn(databaseService.company, 'create')
        .mockResolvedValue(result as Company);

      expect(await service.create(data)).toEqual(
        `Company ${data.company_id} created successfully`,
      );
    });

    it('Should throw a ConflictException when email already exists', async () => {
      jest
        .spyOn(databaseService.company, 'findUnique')
        .mockResolvedValueOnce({ email: 'existing@email.com' } as Company)
        .mockResolvedValueOnce(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new ConflictException(error);
      });

      await expect(
        service.create({
          ...data,
          email: 'existing@email.com',
        }),
      ).rejects.toThrow(ConflictException);

      expect(databaseService.company.findUnique).toHaveBeenCalledTimes(2);
      expect(databaseService.company.create).toHaveBeenCalledTimes(0);
    });

    it('Should throw a ConflictException when name already exists', async () => {
      const fakeName = TestData.companyName();

      jest
        .spyOn(databaseService.company, 'findUnique')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ name: fakeName } as Company);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new ConflictException(error);
      });

      await expect(service.create({ ...data, name: fakeName })).rejects.toThrow(
        ConflictException,
      );

      expect(databaseService.company.findUnique).toHaveBeenCalledTimes(2);
      expect(databaseService.company.create).toHaveBeenCalledTimes(0);
    });

    it('Should throw a InternalServerErrorException', async () => {
      jest
        .spyOn(databaseService.company, 'findFirst')
        .mockResolvedValue({ ...data, name: '', email: '' } as Company);
      jest.spyOn(databaseService.company, 'findUnique').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.company, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to create company'),
        );

      await expect(service.create(data)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    const data = [
      {
        company_id: TestData.uuid(),
        name: TestData.firstName(),
        fantasyName: TestData.fullName(),
        email: TestData.email(),
      },
    ] as Company[];

    it('Should return all companies', async () => {
      jest.spyOn(databaseService.company, 'findMany').mockResolvedValue(data);

      expect(await service.findAll()).toEqual(data);
    });

    it('Shold return InternalServerErrorException', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.company, 'findMany')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to fetch companies'),
        );

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    const data = {
      company_id: TestData.uuid(),
      name: TestData.firstName(),
      fantasyName: TestData.fullName(),
      email: TestData.email(),
    } as Company;

    it('Should return a company', async () => {
      jest.spyOn(databaseService.company, 'findUnique').mockResolvedValue(data);

      expect(await service.findOne(data.company_id)).toEqual(data);
    });

    it('Should throw NotFoundException when company not found', async () => {
      jest.spyOn(databaseService.company, 'findUnique').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });

      await expect(service.findOne('Company not found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Shold return InternalServerErrorException', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.company, 'findUnique')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to fetch companies'),
        );

      await expect(service.findOne(data.company_id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const data = {
      company_id: TestData.uuid(),
      name: TestData.firstName(),
      fantasyName: TestData.fullName(),
      email: TestData.email(),
    } as Company;

    it('Should update a company', async () => {
      jest.spyOn(databaseService.company, 'findFirst').mockResolvedValue(data);
      jest.spyOn(databaseService.company, 'findUnique').mockResolvedValue(null);
      jest.spyOn(databaseService.company, 'update').mockResolvedValue(data);

      expect(
        await service.update(data.company_id, data as UpdateCompanyDto),
      ).toEqual(`Company ${data.company_id} updated!`);
    });

    it('Shold return ConflictException when data alredy exists', async () => {
      jest.spyOn(databaseService.company, 'findFirst').mockResolvedValue(data);
      jest
        .spyOn(databaseService.company, 'findUnique')
        .mockResolvedValue({ ...data, email: 'alredy@email.com' } as Company);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new ConflictException(error);
      });
      jest
        .spyOn(databaseService.company, 'update')
        .mockRejectedValue(new ConflictException('email already exists'));

      await expect(
        service.update(data.company_id, {
          ...data,
          email: 'alredy@email.com',
        } as UpdateCompanyDto),
      ).rejects.toThrow(ConflictException);
    });

    it('Shold return NotFoundException', async () => {
      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });
      jest
        .spyOn(databaseService.company, 'findFirst')
        .mockRejectedValue(new NotFoundException('Company not found'));

      await expect(
        service.update(data.company_id, data as UpdateCompanyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    const data = {
      company_id: TestData.uuid(),
      name: TestData.firstName(),
      fantasyName: TestData.fullName(),
      email: TestData.email(),
    } as Company;

    it('Should delete a company', async () => {
      jest.spyOn(databaseService.company, 'findFirst').mockResolvedValue(data);
      jest.spyOn(databaseService.company, 'delete').mockResolvedValue(data);

      expect(await service.remove(data.company_id)).toEqual(
        `Company ${data.company_id} deleted!`,
      );
    });

    it('Should return NotFoundException when company not found', async () => {
      jest.spyOn(databaseService.company, 'findFirst').mockResolvedValue(null);

      mockErrorHandler.handle.mockImplementation((error) => {
        return new NotFoundException(error);
      });

      await expect(service.remove(data.company_id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Shold return InternalServerErrorException', async () => {
      jest.spyOn(databaseService.company, 'findFirst').mockResolvedValue(data);
      mockErrorHandler.handle.mockImplementation((error) => {
        return new InternalServerErrorException(error);
      });
      jest
        .spyOn(databaseService.company, 'delete')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to delete company'),
        );

      await expect(service.remove(data.company_id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
