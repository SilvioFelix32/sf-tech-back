import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  process.env.DATABASE_URL = `postgresql://postgres:${faker.lorem.word()}@test.io:5432/db?schema=public`;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the database', async () => {
    jest.spyOn(prismaService, '$connect').mockResolvedValue();

    await expect(prismaService.$connect()).resolves.toBeUndefined();
  });

  it('should throw InternalServerErrorException on connection failure', async () => {
    jest
      .spyOn(prismaService, '$connect')
      .mockRejectedValue(
        new InternalServerErrorException('Failed to connect to database'),
      );

    await expect(prismaService.$connect()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should enable shutdown hooks', async () => {
    const mockApp: any = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    await prismaService.enableShutdownHooks(mockApp);
    process.emit('beforeExit', 0);

    expect(mockApp.close).toHaveBeenCalled();
  });
});
