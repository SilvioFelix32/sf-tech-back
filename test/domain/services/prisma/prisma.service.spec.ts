import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/domain/services/prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  process.env.DATABASE_URL = `postgresql://postgres:${faker.lorem.word()}@test.io:5432/db?schema=public`;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.$disconnect();
  });

  it('Should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('Should connect to the database successfully on the first attempt', async () => {
    jest.spyOn(prismaService, '$connect').mockResolvedValueOnce();

    await prismaService.onModuleInit();

    expect(prismaService.$connect).toHaveBeenCalledTimes(1);
  });

  it('Should retry connection and succeed on the second attempt', async () => {
    jest
      .spyOn(prismaService, '$connect')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce();

    await prismaService['connectWithRetry']();

    expect(prismaService.$connect).toHaveBeenCalledTimes(2);
  });

  it('Should throw InternalServerErrorException after maximum connection attempts', async () => {
    jest
      .spyOn(prismaService, '$connect')
      .mockRejectedValue(new Error('Connection failed'));

    await expect((prismaService as any).connectWithRetry()).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(prismaService.$connect).toHaveBeenCalledTimes(3);
  });

  it('Should log error message when connection fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    jest
      .spyOn(prismaService, '$connect')
      .mockRejectedValue(new Error('Connection failed'));

    await prismaService.onModuleInit();

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      'PrismaService.onModuleInit(): Started creating connection with DB',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'PrismaService.connectWithRetry(): attempt 1 to connect failed with the database, Error:',
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'PrismaService.connectWithRetry(): attempt 2 to connect failed with the database, Error:',
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'PrismaService.connectWithRetry(): attempt 3 to connect failed with the database, Error:',
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'PrismaService.onModuleInit(): Failed to connect to database:',
      ),
    );

    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  it('Should enable shutdown hooks', async () => {
    const mockApp: any = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    await prismaService.enableShutdownHooks(mockApp);
    process.emit('beforeExit', 0);

    expect(mockApp.close).toHaveBeenCalled();
  });
});
