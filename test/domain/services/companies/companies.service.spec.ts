import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { Company } from '@prisma/client';
import { CompaniesService } from '../../../../src/domain/services/companies/companies.service';
import { PrismaService } from '../../../../src/infrasctructure/prisma/prisma.service';
import { UpdateCompanyDto } from '../../../../src/application/dtos/company/update-company.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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

const company_id = faker.string.uuid();
const dbData = {
  data: [
    {
      company_id,
      name: faker.person.firstName(),
      fantasyName: faker.person.fullName(),
      email: faker.internet.email(),
    },
  ] as Company[],
};

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const data = {
      company_id: faker.string.uuid(),
      name: faker.person.firstName(),
      fantasyName: faker.person.fullName(),
      email: faker.internet.email(),
    };

    const result = data as Company;
    it('should create a company', async () => {
      jest
        .spyOn(prismaService.company, 'findFirst')
        .mockResolvedValue({} as Company);
      jest
        .spyOn(prismaService.company, 'create')
        .mockResolvedValue(result as Company);

      expect(await service.create(data)).toEqual(result);
    });

    it('should throw a ConflictException when email already exists', async () => {
      jest
        .spyOn(prismaService.company, 'findFirst')
        .mockResolvedValue({ ...data, name: 'fakeName', email: '' } as Company);
      jest
        .spyOn(prismaService.company, 'create')
        .mockRejectedValue(
          new ConflictException('Company with this email already exists'),
        );

      await expect(service.create(data)).rejects.toThrow(ConflictException);
    });

    it('should throw a ConflictException when name already exists', async () => {
      const fakeName = faker.company.name();

      jest
        .spyOn(prismaService.company, 'findFirst')
        .mockResolvedValue({ ...data, name: fakeName, email: '' } as Company);
      jest
        .spyOn(prismaService.company, 'create')
        .mockRejectedValue(
          new ConflictException('Company with this name already exists'),
        );

      await expect(service.create({ ...data, name: fakeName })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.company, 'findFirst')
        .mockResolvedValue({ ...data, name: '', email: '' } as Company);
      jest
        .spyOn(prismaService.company, 'create')
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
        company_id: faker.string.uuid(),
        name: faker.person.firstName(),
        fantasyName: faker.person.fullName(),
        email: faker.internet.email(),
      },
    ] as Company[];

    it('should return all companies', async () => {
      jest.spyOn(prismaService.company, 'findMany').mockResolvedValue(data);

      expect(await service.findAll()).toEqual(data);
    });

    it('Shold return InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.company, 'findMany')
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
      company_id: faker.string.uuid(),
      name: faker.person.firstName(),
      fantasyName: faker.person.fullName(),
      email: faker.internet.email(),
    } as Company;

    it('should return a company', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(data);

      expect(await service.findOne(data.company_id)).toEqual(data);
    });

    it('Shold return NotFoundException when company not found', async () => {
      jest
        .spyOn(prismaService.company, 'findUnique')
        .mockRejectedValue(new NotFoundException('Company not found'));

      await expect(service.findOne(data.company_id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Shold return InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.company, 'findUnique')
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
      company_id: faker.string.uuid(),
      name: faker.person.firstName(),
      fantasyName: faker.person.fullName(),
      email: faker.internet.email(),
    } as Company;

    it('should update a company', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(data);
      jest.spyOn(prismaService.company, 'update').mockResolvedValue(data);

      expect(
        await service.update(data.company_id, data as UpdateCompanyDto),
      ).toEqual(data);
    });

    it('Shold return NotFoundException when company not found', async () => {
      jest
        .spyOn(prismaService.company, 'findUnique')
        .mockRejectedValue(new NotFoundException('Company not found'));

      await expect(
        service.update(data.company_id, data as UpdateCompanyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('Shold return InternalServerErrorException', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(data);
      jest
        .spyOn(prismaService.company, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to fetch company'),
        );

      await expect(
        service.update(data.company_id, data as UpdateCompanyDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    const data = {
      company_id: faker.string.uuid(),
      name: faker.person.firstName(),
      fantasyName: faker.person.fullName(),
      email: faker.internet.email(),
    } as Company;

    it('should delete a company', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(data);
      jest.spyOn(prismaService.company, 'delete').mockResolvedValue(data);

      expect(await service.remove(data.company_id)).toEqual(
        `Company ${data.company_id} deleted!`,
      );
    });

    it('Shold return NotFoundException when company not found', async () => {
      jest
        .spyOn(prismaService.company, 'findUnique')
        .mockRejectedValue(new NotFoundException('Company not found'));

      await expect(service.remove(data.company_id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Shold return InternalServerErrorException', async () => {
      jest.spyOn(prismaService.company, 'findUnique').mockResolvedValue(data);
      jest
        .spyOn(prismaService.company, 'delete')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to delete company'),
        );

      await expect(service.remove(data.company_id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
