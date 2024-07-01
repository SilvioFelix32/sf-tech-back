import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../src/domain/services/users/users.service';
import { RedisService } from '../../../../src/infrasctructure/cache/redis.service';
import {
  IPaginatedUserResponse,
  IUserResponse,
} from '../../../../src/infrasctructure/types/user-response';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../../../src/infrasctructure/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../../../../src/application/dtos/users/create-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
  },
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

const dbData = {
  user_id: faker.string.uuid(),
  company_id: faker.string.uuid(),
  name: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
} as IUserResponse;

const cachedDataResponse = {
  data: {
    data: [dbData],
    meta: {
      currentPage: 1,
      lastPage: 1,
      next: null,
      perPage: 10,
      prev: null,
      total: 1,
    },
  },
  message: 'Users retrieved from cache',
} as IPaginatedUserResponse;

const dbDataResponse = {
  data: {
    data: [dbData],
    meta: {
      currentPage: 1,
      lastPage: 1,
      next: null,
      perPage: 10,
      prev: null,
      total: 1,
    },
  },
  message: 'Users retrieved from database',
} as IPaginatedUserResponse;

describe('UsersService', () => {
  let service: UsersService;
  let redisService: RedisService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue([] as User[]);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(dbData as User);

      expect(
        await service.create(dbData.company_id, {
          ...dbData,
          password: 'aB2@#stz',
        } as CreateUserDto),
      ).toEqual(dbData);
    });

    it('should throw if user has no company informed', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new BadRequestException('User needs a company ID'));

      await expect(
        service.create('', dbData as CreateUserDto),
      ).rejects.toThrow();
    });

    it('should throw if user email already exists in this company', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new BadRequestException('User needs a company ID'));

      await expect(
        service.create('', dbData as CreateUserDto),
      ).rejects.toThrow();
    });

    it('should throw on password validation', async () => {
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue([dbData] as User[]);
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(
          new BadRequestException(
            'Password must be at least 8 characters long',
          ),
        );

      await expect(
        service.create('', {
          ...dbData,
          password: '123456',
        } as CreateUserDto),
      ).rejects.toThrow();
    });

    it('should throw an InternalServerErrorException if product there is no category_id', async () => {
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue([] as User[]);
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Error creating user'),
        );

      await expect(
        service.create(dbData.company_id, {
          ...dbData,
          password: 'aB2@#stz',
        } as CreateUserDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
