import { Test } from '@nestjs/testing';
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
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await databaseService.onModuleInit();

    expect(databaseService.$connect).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] Connection attempt 1/3 to database...',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] ✅ Service connected to database',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] 📊 Active instance: DatabaseService',
    );

    consoleLogSpy.mockRestore();
  });

  it('Should retry connection and succeed on the second attempt', async () => {
    jest
      .spyOn(databaseService, '$connect')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce();

    await databaseService['connectWithRetry']();

    expect(databaseService.$connect).toHaveBeenCalledTimes(2);
  });

  it('Should throw Error after maximum connection attempts', async () => {
    jest
      .spyOn(databaseService, '$connect')
      .mockRejectedValue(new Error('Connection failed'));

    await expect((databaseService as any).connectWithRetry()).rejects.toThrow(
      'Maximum connection attempts to connect to the database (3) reached.',
    );

    expect(databaseService.$connect).toHaveBeenCalledTimes(3);
  });

  it('Should log connection attempts when retrying', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    jest
      .spyOn(databaseService, '$connect')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce();

    await databaseService['connectWithRetry']();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] Connection attempt 1/3 to database...',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] Connection attempt 2/3 to database...',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] ✅ Service connected to database',
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[DatabaseService] 📊 Active instance: DatabaseService',
    );

    consoleLogSpy.mockRestore();
  });

  it('Should disconnect on module destroy', async () => {
    jest.spyOn(databaseService, '$disconnect').mockResolvedValueOnce();

    await databaseService.onModuleDestroy();

    expect(databaseService.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('Should enable shutdown hooks and disconnect on beforeExit', async () => {
    const mockApp: any = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(databaseService, '$disconnect').mockResolvedValueOnce();

    await databaseService.enableShutdownHooks(mockApp);

    const beforeExitListeners = process.listeners('beforeExit');
    expect(beforeExitListeners.length).toBeGreaterThan(0);

    process.emit('beforeExit', 0);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(databaseService.$disconnect).toHaveBeenCalled();
    expect(mockApp.close).toHaveBeenCalled();
  });
});
