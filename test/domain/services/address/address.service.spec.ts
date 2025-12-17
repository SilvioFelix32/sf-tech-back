import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from '../../../../src/domain/services/address/address.service';
import { CreateAddressStandaloneDto } from '../../../../src/application/dtos/address/create-address-standalone.dto';
import { UpdateAddressDto } from '../../../../src/application/dtos/address/update-address.dto';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';
import { ErrorHandler } from '../../../../src/shared/errors/error-handler';
import { Logger } from '../../../../src/shared/logger/logger.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TestData } from '../../../helpers/test-data';
import { Address } from '../../../../src/domain/entities/address/address.entity';
import { AddressType } from '../../../../src/application/dtos/sftech-user/create-address.dto';

const mockDatabaseService = {
  address: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sfTechUser: {
    findUnique: jest.fn(),
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

const mockUser = (overrides?: Partial<any>) => ({
  user_id: TestData.uuid(),
  first_name: TestData.firstName(),
  last_name: TestData.string(8),
  email: TestData.email(),
  cpf: '12345678901',
  cellphone: '11999999999',
  birthdate: '1990-01-01',
  gender: 'Other',
  ...overrides,
});

const mockAddress = (user_id: string, overrides?: Partial<Address>): Address => ({
  address_id: TestData.uuid(),
  user_id,
  address_type: 'House' as AddressType,
  address_preference: 'House' as AddressType,
  street: 'Test Street',
  number: '123',
  neighborhood: 'Test Neighborhood',
  city: 'Test City',
  cep: '12345678',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockCreateAddressDto = (user_id: string, overrides?: Partial<CreateAddressStandaloneDto>): CreateAddressStandaloneDto => ({
  user_id,
  address_type: AddressType.House,
  address_preference: AddressType.House,
  street: 'Test Street',
  number: '123',
  neighborhood: 'Test Neighborhood',
  city: 'Test City',
  cep: '12345678',
  ...overrides,
});

describe('AddressService', () => {
  let service: AddressService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ErrorHandler, useValue: mockErrorHandler },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const user_id = TestData.uuid();
    const createDto = mockCreateAddressDto(user_id);

    it('Should create an address', async () => {
      const createdAddress = mockAddress(user_id);
      const existingUser = mockUser({ user_id });

      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.address, 'create')
        .mockResolvedValue(createdAddress as any);

      const result = await service.create(createDto);

      expect(result).toEqual(`Address ${createdAddress.address_id} created successfully`);
      expect(databaseService.address.create).toHaveBeenCalledWith({
        data: {
          user_id: createDto.user_id,
          address_type: createDto.address_type,
          address_preference: createDto.address_preference,
          street: createDto.street,
          number: createDto.number,
          neighborhood: createDto.neighborhood,
          city: createDto.city,
          cep: createDto.cep,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `AddressService.create() - Address ${createdAddress.address_id} created successfully`,
        { metadata: { address_id: createdAddress.address_id, user_id } },
      );
    });

    it('Should throw NotFoundException when user not found', async () => {
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);

      expect(databaseService.address.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on create error', async () => {
      const existingUser = mockUser({ user_id });
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(existingUser as any);
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.address, 'create')
        .mockRejectedValue(new InternalServerErrorException('Failed to create address'));

      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const user_id = TestData.uuid();

    it('Should return all addresses for a user', async () => {
      const addresses = [
        mockAddress(user_id),
        mockAddress(user_id, { address_id: TestData.uuid(), street: 'Another Street' }),
      ];
      const existingUser = mockUser({ user_id });

      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.address, 'findMany')
        .mockResolvedValue(addresses as any);

      const result = await service.findAll(user_id);

      expect(result).toEqual(addresses);
      expect(databaseService.address.findMany).toHaveBeenCalledWith({
        where: { user_id },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `AddressService.findAll() - Retrieved ${addresses.length} addresses for user ${user_id}`,
        { metadata: { user_id, count: addresses.length } },
      );
    });

    it('Should return empty array when user has no addresses', async () => {
      const existingUser = mockUser({ user_id });

      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(existingUser as any);
      jest
        .spyOn(databaseService.address, 'findMany')
        .mockResolvedValue([]);

      const result = await service.findAll(user_id);

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `AddressService.findAll() - Retrieved 0 addresses for user ${user_id}`,
        { metadata: { user_id, count: 0 } },
      );
    });

    it('Should throw NotFoundException when user not found', async () => {
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.findAll(user_id)).rejects.toThrow(NotFoundException);

      expect(databaseService.address.findMany).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on find error', async () => {
      const existingUser = mockUser({ user_id });
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(existingUser as any);
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.address, 'findMany')
        .mockRejectedValue(new InternalServerErrorException('Failed to fetch addresses'));

      await expect(service.findAll(user_id)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const address_id = TestData.uuid();
    const user_id = TestData.uuid();
    const address = mockAddress(user_id, { address_id });

    it('Should return an address by id', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(address as any);

      const result = await service.findOne(address_id);

      expect(result).toEqual(address);
      expect(databaseService.address.findUnique).toHaveBeenCalledWith({
        where: { address_id },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `AddressService.findOne() - Address ${address_id} retrieved successfully`,
        { metadata: { address_id } },
      );
    });

    it('Should throw NotFoundException when address not found', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.findOne(address_id)).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on find error', async () => {
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockRejectedValue(new InternalServerErrorException('Failed to fetch address'));

      await expect(service.findOne(address_id)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const address_id = TestData.uuid();
    const user_id = TestData.uuid();
    const existingAddress = mockAddress(user_id, { address_id });
    const updateDto: UpdateAddressDto = {
      street: 'Updated Street',
      number: '456',
    };

    it('Should update an address', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(existingAddress as any);
      jest
        .spyOn(databaseService.address, 'update')
        .mockResolvedValue({ ...existingAddress, ...updateDto } as any);

      const result = await service.update(address_id, updateDto);

      expect(result).toEqual(`Address ${address_id} updated successfully`);
      expect(databaseService.address.update).toHaveBeenCalledWith({
        data: {
          street: updateDto.street,
          number: updateDto.number,
        },
        where: { address_id },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `AddressService.update() - Address ${address_id} updated successfully`,
        { metadata: { address_id } },
      );
    });

    it('Should validate user when user_id is provided in update', async () => {
      const newUser_id = TestData.uuid();
      const updateWithUserId: UpdateAddressDto = {
        user_id: newUser_id,
        street: 'Updated Street',
      };
      const newUser = mockUser({ user_id: newUser_id });

      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(existingAddress as any);
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(newUser as any);
      jest
        .spyOn(databaseService.address, 'update')
        .mockResolvedValue({ ...existingAddress, ...updateWithUserId } as any);

      const result = await service.update(address_id, updateWithUserId);

      expect(result).toEqual(`Address ${address_id} updated successfully`);
      expect(databaseService.sfTechUser.findUnique).toHaveBeenCalledWith({
        where: { user_id: newUser_id },
      });
    });

    it('Should throw NotFoundException when address not found', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.update(address_id, updateDto)).rejects.toThrow(NotFoundException);

      expect(databaseService.address.update).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw NotFoundException when user not found in update with user_id', async () => {
      const updateWithUserId: UpdateAddressDto = {
        user_id: TestData.uuid(),
        street: 'Updated Street',
      };

      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(existingAddress as any);
      jest
        .spyOn(databaseService.sfTechUser, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.update(address_id, updateWithUserId)).rejects.toThrow(NotFoundException);

      expect(databaseService.address.update).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on update error', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(existingAddress as any);
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.address, 'update')
        .mockRejectedValue(new InternalServerErrorException('Failed to update address'));

      await expect(service.update(address_id, updateDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const address_id = TestData.uuid();
    const user_id = TestData.uuid();
    const existingAddress = mockAddress(user_id, { address_id });

    it('Should delete an address', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(existingAddress as any);
      jest
        .spyOn(databaseService.address, 'delete')
        .mockResolvedValue(existingAddress as any);

      const result = await service.remove(address_id);

      expect(result).toEqual(`Address ${address_id} deleted successfully`);
      expect(databaseService.address.delete).toHaveBeenCalledWith({
        where: { address_id },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `AddressService.remove() - Address ${address_id} deleted successfully`,
        { metadata: { address_id } },
      );
    });

    it('Should throw NotFoundException when address not found', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(null);
      mockErrorHandler.handle.mockImplementation((error) => new NotFoundException(error));

      await expect(service.remove(address_id)).rejects.toThrow(NotFoundException);

      expect(databaseService.address.delete).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('Should throw InternalServerErrorException on delete error', async () => {
      jest
        .spyOn(databaseService.address, 'findUnique')
        .mockResolvedValue(existingAddress as any);
      mockErrorHandler.handle.mockImplementation((error) => new InternalServerErrorException(error));
      jest
        .spyOn(databaseService.address, 'delete')
        .mockRejectedValue(new InternalServerErrorException('Failed to delete address'));

      await expect(service.remove(address_id)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

