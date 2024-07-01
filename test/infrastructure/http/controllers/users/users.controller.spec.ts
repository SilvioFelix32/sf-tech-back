import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../../src/domain/services/users/users.service';
import { UsersController } from '../../../../../src/infrasctructure/http/controllers/users/users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
