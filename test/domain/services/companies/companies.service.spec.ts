import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { Company } from '@prisma/client';
import { CompaniesService } from '../../../../src/domain/services/companies/companies.service';
import { PrismaService } from '../../../../src/infrasctructure/prisma/prisma.service';
import {
  ConflictException,
  InternalServerErrorException,
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

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('delete', () => {});
});
