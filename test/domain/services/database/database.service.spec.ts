import { Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    await databaseService.$disconnect();
  });

  it('Should be defined', () => {
    expect(databaseService).toBeDefined();
  });

  it('Should connect to the database successfully on the first attempt', async () => {
    jest.spyOn(databaseService, '$connect').mockResolvedValueOnce();

    await databaseService.onModuleInit();

    expect(databaseService.$connect).toHaveBeenCalledTimes(1);
  });

  it('Should retry connection and succeed on the second attempt', async () => {
    jest
      .spyOn(databaseService, '$connect')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce();

    await databaseService['connectWithRetry']();

    expect(databaseService.$connect).toHaveBeenCalledTimes(2);
  });

  it('Should throw InternalServerErrorException after maximum connection attempts', async () => {
    jest
        .spyOn(databaseService, '$connect')
      .mockRejectedValue(new Error('Connection failed'));

    await expect((databaseService as any).connectWithRetry()).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(databaseService.$connect).toHaveBeenCalledTimes(3);
  });

  it('Should log error message when connection fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    jest
      .spyOn(databaseService, '$connect')
      .mockRejectedValue(new Error('Connection failed'));

    await databaseService.onModuleInit();

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      'DatabaseService.onModuleInit(): Started creating connection with DB',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'DatabaseService.connectWithRetry(): attempt 1 to connect failed with the database, Error:',
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'DatabaseService.connectWithRetry(): attempt 2 to connect failed with the database, Error:',
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'DatabaseService.connectWithRetry(): attempt 3 to connect failed with the database, Error:',
      ),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'DatabaseService.onModuleInit(): Failed to connect to database:',
      ),
    );

    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  it('Should enable shutdown hooks', async () => {
    const mockApp: any = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    await databaseService.enableShutdownHooks(mockApp);
    process.emit('beforeExit', 0);

    expect(mockApp.close).toHaveBeenCalled();
  });
});
