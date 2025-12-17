import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from '../../../../../src/infrastructure/http/controllers/address/address.controller';
import { AddressService } from '../../../../../src/domain/services/address/address.service';
import { TestData } from '../../../../helpers/test-data';
import { CreateAddressStandaloneDto } from '../../../../../src/application/dtos/address/create-address-standalone.dto';
import { UpdateAddressDto } from '../../../../../src/application/dtos/address/update-address.dto';
import { Address } from '../../../../../src/domain/entities/address/address.entity';
import { AddressType } from '../../../../../src/application/dtos/sftech-user/create-address.dto';

const mockAddressService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const user_id = TestData.uuid();
const address_id = TestData.uuid();

const createAddressDto: CreateAddressStandaloneDto = {
  user_id,
  address_type: AddressType.House,
  address_preference: AddressType.House,
  street: 'Test Street',
  number: '123',
  neighborhood: 'Test Neighborhood',
  city: 'Test City',
  cep: '12345678',
};

const address: Address = {
  address_id,
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
};

describe('AddressController', () => {
  let controller: AddressController;
  let addressService: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        { provide: AddressService, useValue: mockAddressService },
      ],
    }).compile();

    controller = module.get<AddressController>(AddressController);
    addressService = module.get<AddressService>(AddressService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Should create an address', async () => {
      const expectedResult = `Address ${address_id} created successfully`;
      mockAddressService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createAddressDto);

      expect(result).toEqual(expectedResult);
      expect(addressService.create).toHaveBeenCalledWith(createAddressDto);
      expect(addressService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('Should return all addresses for a user', async () => {
      const addresses = [address, { ...address, address_id: TestData.uuid() }];
      mockAddressService.findAll.mockResolvedValue(addresses);

      const result = await controller.findAll(user_id);

      expect(result).toEqual(addresses);
      expect(addressService.findAll).toHaveBeenCalledWith(user_id);
      expect(addressService.findAll).toHaveBeenCalledTimes(1);
    });

    it('Should return empty array when user has no addresses', async () => {
      mockAddressService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(user_id);

      expect(result).toEqual([]);
      expect(addressService.findAll).toHaveBeenCalledWith(user_id);
    });
  });

  describe('findOne', () => {
    it('Should return an address by id', async () => {
      mockAddressService.findOne.mockResolvedValue(address);

      const result = await controller.findOne(address_id);

      expect(result).toEqual(address);
      expect(addressService.findOne).toHaveBeenCalledWith(address_id);
      expect(addressService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateDto: UpdateAddressDto = {
      street: 'Updated Street',
      number: '456',
    };

    it('Should update an address', async () => {
      const expectedResult = `Address ${address_id} updated successfully`;
      mockAddressService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(address_id, updateDto);

      expect(result).toEqual(expectedResult);
      expect(addressService.update).toHaveBeenCalledWith(address_id, updateDto);
      expect(addressService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('Should delete an address', async () => {
      const expectedResult = `Address ${address_id} deleted successfully`;
      mockAddressService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(address_id);

      expect(result).toEqual(expectedResult);
      expect(addressService.remove).toHaveBeenCalledWith(address_id);
      expect(addressService.remove).toHaveBeenCalledTimes(1);
    });
  });
});

