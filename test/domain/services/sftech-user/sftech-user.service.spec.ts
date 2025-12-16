import { Test, TestingModule } from '@nestjs/testing';
import { SfTechUserService } from '../../../../src/domain/services/sftech-user/sftech-user.service';
import { CreateSfTechUserDto, Gender } from '../../../../src/application/dtos/sftech-user/create-sftech-user.dto';
import { UpdateSfTechUserDto } from '../../../../src/application/dtos/sftech-user/update-sftech-user.dto';
import { AddressType } from '../../../../src/application/dtos/sftech-user/create-address.dto';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { Logger } from '../../../../src/shared/logger/logger.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TestData } from '../../../helpers/test-data';
import { SfTechUser } from '../../../../src/domain/entities/sftech-user/sftech-user.entity';
import { Address } from '../../../../src/domain/entities/address/address.entity';

const mockDatabaseService = {
  sfTechUser: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
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

const mockUser = (overrides?: Partial<SfTechUser>): SfTechUser => ({
  user_id: TestData.uuid(),
  first_name: TestData.firstName(),
  last_name: TestData.string(8),
  email: TestData.email(),
  cpf: '12345678901',
  cellphone: '11999999999',
  birthdate: '1990-01-01',
  gender: 'Other' as 'Male' | 'Female' | 'Other',
  addresses: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockCreateUserDto = (overrides?: Partial<CreateSfTechUserDto>): CreateSfTechUserDto => ({
  first_name: TestData.firstName(),
  last_name: TestData.string(8),
  email: TestData.email(),
  cpf: '12345678901',
  cellphone: '11999999999',
  birthdate: '1990-01-01',
  gender: Gender.Other,
  addresses: [
    {
      address_type: AddressType.House,
      address_preference: AddressType.House,
      street: 'Test Street',
      number: '123',
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      cep: '12345678',
    },
  ],
  ...overrides,
});

const mockAddress = (user_id: string, overrides?: Partial<Address>): Address => ({
  address_id: TestData.uuid(),
  user_id,
  address_type: 'House' as 'House' | 'Work' | 'Temporary',
  address_preference: 'House' as 'House' | 'Work' | 'Temporary',
  street: 'Test Street',
  number: '123',
  neighborhood: 'Test Neighborhood',
  city: 'Test City',
  cep: '12345678',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('SfTechUserService', () => {
  let service: SfTechUserService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SfTechUserService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<SfTechUserService>(SfTechUserService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Should create a user without addresses', async () => {
      const createDto = mockCreateUserDto({ addresses: undefined });
      const createdUser = mockUser({
        first_name: createDto.first_name,
        last_name: createDto.last_name,
        email: createDto.email,
        cpf: createDto.cpf,
        cellphone: createDto.cellphone,
        birthdate: createDto.birthdate,
        gender: createDto.gender as 'Male' | 'Female' | 'Other',
      });

      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(databaseService.sfTechUser, 'create')
        .mockResolvedValue(createdUser as any);

      const result = await service.create(createDto);

      expect(result).toEqual(`User ${createdUser.user_id} created successfully`);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `SfTechUserService.create() - User ${createdUser.user_id} created successfully`,
        { metadata: { user_id: createdUser.user_id } },
      );
    });

    it('Should create a user with addresses', async () => {
      const createDto = mockCreateUserDto();
      const createdUser = mockUser({
        first_name: createDto.first_name,
        last_name: createDto.last_name,
        email: createDto.email,
        cpf: createDto.cpf,
        cellphone: createDto.cellphone,
        birthdate: createDto.birthdate,
        gender: createDto.gender as 'Male' | 'Female' | 'Other',
      });

      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(databaseService.sfTechUser, 'create')
        .mockResolvedValue(createdUser as any);

      const result = await service.create(createDto);

      expect(result).toEqual(`User ${createdUser.user_id} created successfully`);
      expect(databaseService.sfTechUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          first_name: createDto.first_name,
          email: createDto.email,
          addresses: { create: [expect.objectContaining({ street: createDto.addresses![0].street })] },
        }),
      });
    });

    it('Should throw ConflictException when email already exists', async () => {
      const createDto = mockCreateUserDto();
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValueOnce({ email: createDto.email } as any)
        .mockResolvedValueOnce(null);
      mockErrorHandler.handle.mockImplementation((error) => new ConflictException(error));

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);

      expect(databaseService.sfTechUser.findUnique).toHaveBeenCalledTimes(2);
      expect(databaseService.sfTechUser.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw ConflictException when cpf already exists', async () => {
      const createDto = mockCreateUserDto();
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ cpf: createDto.cpf } as any);
      mockErrorHandler.handle.mockImplementation((error) => new ConflictException(error));

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);

      expect(databaseService.sfTechUser.findUnique).toHaveBeenCalledTimes(2);
      expect(databaseService.sfTechUser.create).not.toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on create error', async () => {
      const createDto = mockCreateUserDto();
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.sfTechUser, 'create')
        .mockRejectedValue(new InternalServerErrorException('Failed to create user'));

      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const user_id = TestData.uuid();

    it('Should return a user with addresses', async () => {
      const user = mockUser({ user_id, addresses: [mockAddress(user_id)] });
      jest.spyOn(databaseService.sfTechUser, 'findUnique').mockResolvedValue(user as any);

      const result = await service.findById(user_id);

      expect(result).toEqual(user);
      expect(databaseService.sfTechUser.findUnique).toHaveBeenCalledWith({
        where: { user_id },
        include: { addresses: true },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `SfTechUserService.findById() - User ${user_id} retrieved successfully`,
        { metadata: { user_id } },
      );
    });

    it('Should throw NotFoundException when user not found', async () => {
      jest.spyOn(databaseService.sfTechUser, 'findUnique').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.findById(user_id)).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on find error', async () => {
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockRejectedValue(new InternalServerErrorException('Failed to fetch user'));

      await expect(service.findById(user_id)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const user_id = TestData.uuid();
    const existingUser = mockUser({ user_id });
    const updateDto: UpdateSfTechUserDto = {
      first_name: 'Updated Name',
      cellphone: '11988888888',
    };

    it('Should update a user', async () => {
      jest.spyOn(databaseService.sfTechUser, 'findFirst').mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.sfTechUser, 'update')
        .mockResolvedValue({ ...existingUser, ...updateDto } as any);

      const result = await service.update(user_id, updateDto);

      expect(result).toEqual(`User ${user_id} updated!`);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `SfTechUserService.update() - User ${user_id} updated successfully`,
        { metadata: { user_id } },
      );
    });

    it('Should throw NotFoundException when user not found', async () => {
      jest.spyOn(databaseService.sfTechUser, 'findFirst').mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.update(user_id, updateDto)).rejects.toThrow(NotFoundException);
      expect(databaseService.sfTechUser.update).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw ConflictException when email already exists for another user', async () => {
      const updateWithEmail: UpdateSfTechUserDto = { email: TestData.email() };
      jest.spyOn(databaseService.sfTechUser, 'findFirst').mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue({ user_id: TestData.uuid(), email: updateWithEmail.email } as any);
      mockErrorHandler.handle.mockImplementation((error) => new ConflictException(error));

      await expect(service.update(user_id, updateWithEmail)).rejects.toThrow(ConflictException);
      expect(databaseService.sfTechUser.update).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw ConflictException when cpf already exists for another user', async () => {
      const updateWithCpf: UpdateSfTechUserDto = { cpf: '98765432100' };
      jest.spyOn(databaseService.sfTechUser, 'findFirst').mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue({ user_id: TestData.uuid(), cpf: updateWithCpf.cpf } as any);
      mockErrorHandler.handle.mockImplementation((error) => new ConflictException(error));

      await expect(service.update(user_id, updateWithCpf)).rejects.toThrow(ConflictException);
      expect(databaseService.sfTechUser.update).not.toHaveBeenCalled();
    });

    it('Should allow update when email/cpf belongs to the same user', async () => {
      const updateWithOwnEmail: UpdateSfTechUserDto = {
        email: existingUser.email,
        first_name: 'Updated Name',
      };
      jest.spyOn(databaseService.sfTechUser, 'findFirst').mockResolvedValue(existingUser as any);
      jest.spyOn(databaseService.sfTechUser, 'findUnique').mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.sfTechUser, 'update')
        .mockResolvedValue({ ...existingUser, ...updateWithOwnEmail } as any);

      const result = await service.update(user_id, updateWithOwnEmail);

      expect(result).toEqual(`User ${user_id} updated!`);
      expect(databaseService.sfTechUser.update).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on update error', async () => {
      jest.spyOn(databaseService.sfTechUser, 'findFirst').mockResolvedValue(existingUser as any);
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.sfTechUser, 'update')
        .mockRejectedValue(new InternalServerErrorException('Failed to update user'));

      await expect(service.update(user_id, updateDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

