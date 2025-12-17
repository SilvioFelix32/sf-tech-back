import { Test, TestingModule } from '@nestjs/testing';
import { SfTechUserController } from '../../../../../src/infrastructure/http/controllers/sftech-user/sftech-user.controller';
import { SfTechUserService } from '../../../../../src/domain/services/sftech-user/sftech-user.service';
import { TestData } from '../../../../helpers/test-data';
import { CreateSfTechUserDto } from '../../../../../src/application/dtos/sftech-user/create-sftech-user.dto';
import { UpdateSfTechUserDto } from '../../../../../src/application/dtos/sftech-user/update-sftech-user.dto';
import { SfTechUser } from '../../../../../src/domain/entities/sftech-user/sftech-user.entity';

const mockSfTechUserService = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

const createUserDto: CreateSfTechUserDto = {
  user_id: TestData.uuid(),
  first_name: TestData.firstName(),
  last_name: TestData.string(8),
  email: TestData.email(),
  cpf: '12345678901',
  cellphone: '11999999999',
  birthdate: '1990-01-01',
  gender: 'Other',
};

const user: SfTechUser = {
  user_id: TestData.uuid(),
  ...createUserDto,
  addresses: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SfTechUserController', () => {
  let controller: SfTechUserController;
  let sfTechUserService: SfTechUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SfTechUserController],
      providers: [
        { provide: SfTechUserService, useValue: mockSfTechUserService },
      ],
    }).compile();

    controller = module.get<SfTechUserController>(SfTechUserController);
    sfTechUserService = module.get<SfTechUserService>(SfTechUserService);
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Should create a user', async () => {
      const expectedResult = `User ${user.user_id} created successfully`;
      mockSfTechUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(sfTechUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(sfTechUserService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('Should return a user by id', async () => {
      mockSfTechUserService.findById.mockResolvedValue(user);

      const result = await controller.findById(user.user_id!);

      expect(result).toEqual(user);
      expect(sfTechUserService.findById).toHaveBeenCalledWith(user.user_id);
      expect(sfTechUserService.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSfTechUserDto = {
      first_name: 'Updated Name',
      cellphone: '11988888888',
    };

    it('Should update a user', async () => {
      const expectedResult = `User ${user.user_id} updated!`;
      mockSfTechUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(user.user_id!, updateDto);

      expect(result).toEqual(expectedResult);
      expect(sfTechUserService.update).toHaveBeenCalledWith(
        user.user_id,
        updateDto,
      );
      expect(sfTechUserService.update).toHaveBeenCalledTimes(1);
    });
  });
});

