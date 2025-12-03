import { Test } from '@nestjs/testing';
import { DatabaseService } from '../../../../src/domain/services/database/database.service';
import { Logger } from '../../../../src/shared/logger/logger.service';

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
};

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let logger: Logger;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    logger = moduleRef.get<Logger>(Logger);
    jest.clearAllMocks();
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
    expect(mockLogger.info).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Connection attempt 1/3 to database',
      { metadata: { attempt: 1, maxAttempts: 3 } },
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Service connected to database successfully',
    );
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
    expect(mockLogger.error).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Maximum connection attempts reached',
      expect.objectContaining({
        error: expect.any(Error),
        metadata: { attempts: 3, maxAttempts: 3 },
      }),
    );
  });

  it('Should log connection attempts when retrying', async () => {
    jest
      .spyOn(databaseService, '$connect')
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce();

    await databaseService['connectWithRetry']();

    expect(mockLogger.info).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Connection attempt 1/3 to database',
      { metadata: { attempt: 1, maxAttempts: 3 } },
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Retrying connection in 1 second',
      { metadata: { attempt: 1, maxAttempts: 3 } },
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Connection attempt 2/3 to database',
      { metadata: { attempt: 2, maxAttempts: 3 } },
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'DatabaseService.connectWithRetry() - Service connected to database successfully',
    );
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
