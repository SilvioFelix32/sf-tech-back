import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../src/domain/services/users/users.service';
import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import {
  IPaginatedUserResponse,
  IUserResponse,
} from '../../../../src/infrasctructure/types/user-response';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../../../src/domain/services/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../../../../src/application/dtos/users/create-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../../../../src/domain/services/cache/cache.service';
import { FindUserDto } from '../../../../src/application/dtos/users/find-user.dto';
import { UpdateUserDto } from '../../../../src/application/dtos/users/update-user.dto';

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

const mockCacheService = {
  getCache: jest.fn(),
  setCache: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

const userData = {
  user_id: faker.string.uuid(),
  company_id: faker.string.uuid(),
  name: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
} as IUserResponse;

const dbData = {
  data: [userData] as User[],
};

const cachedDataResponse = {
  data: {
    data: [userData],
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
    data: [userData],
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
  let cacheService: CacheService;
  let redisService: RedisService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
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
        .mockResolvedValue(userData as User);

      expect(
        await service.create(userData.company_id, {
          ...userData,
          password: 'aB2@#stz',
        } as CreateUserDto),
      ).toEqual(userData);
    });

    it('should throw if user has no company informed', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new BadRequestException('User needs a company ID'));

      await expect(
        service.create('', userData as CreateUserDto),
      ).rejects.toThrow();
    });

    it('should throw if user email already exists in this company', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new BadRequestException('User needs a company ID'));

      await expect(
        service.create('', userData as CreateUserDto),
      ).rejects.toThrow();
    });

    it('should throw on password validation', async () => {
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue([userData] as User[]);
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(
          new BadRequestException(
            'Password must be at least 8 characters long',
          ),
        );

      await expect(
        service.create('', {
          ...userData,
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
        service.create(userData.company_id, {
          ...userData,
          password: 'aB2@#stz',
        } as CreateUserDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByEmail', () => {
    it('Should find a user by email', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userData as User);

      expect(await service.findByEmail(userData.email)).toEqual(userData);
    });

    it('Should throw a NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findByEmail(userData.email)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should throw an InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(
          new InternalServerErrorException('Error finding user'),
        );

      await expect(service.findByEmail(userData.email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('Should find a user by id', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userData as User);

      expect(await service.findOne(userData.user_id)).toEqual(userData);
    });

    it('Should throw a NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(userData.user_id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should throw an InternalServerErrorException', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(
          new InternalServerErrorException('Error finding user'),
        );

      await expect(service.findOne(userData.user_id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return users from cache if available', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValue(JSON.stringify(cachedDataResponse.data));

      expect(
        await service.findAll({ page: 1, limit: 10 } as FindUserDto),
      ).toEqual(cachedDataResponse);
      expect(redisService.get).toHaveBeenCalledWith('user');
    });

    it('should return users from database if cache is not available', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(dbData.data);
      jest.spyOn(redisService, 'set').mockResolvedValue(null);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      } as FindUserDto);

      expect(result).toEqual(dbDataResponse);
      expect(redisService.get).toHaveBeenCalledWith('user');
    });

    it('should throw an error if database query fails', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockRejectedValue(new Error('Error retrieving users'));

      await expect(
        service.findAll({ page: 1, limit: 10 } as FindUserDto),
      ).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUsertDto: UpdateUserDto = { name: 'test' };
      const result = (await service.update(
        userData.company_id,
        userData.user_id,
        {
          name: 'test',
        },
      )) as User;
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userData as User);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(result);

      expect(
        await service.update(
          userData.company_id,
          userData.user_id,
          updateUsertDto,
        ),
      ).toEqual(result);
    });

    it('should throw an error if user update fails', async () => {
      const updateUsertDto: UpdateUserDto = { name: 'test' };
      jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValue(new Error('Error updating product'));

      await expect(service.update('1', '1', updateUsertDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('remove', () => {});
});
