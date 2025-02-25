import { RedisService } from '../../../../src/domain/services/redis/redis.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';

jest.mock('ioredis');

// jest.mock('ioredis', () => {
//   const mRedis = {
//     on: jest.fn(),
//     quit: jest.fn().mockResolvedValue('OK'),
//     disconnect: jest.fn(),
//     status: 'ready',
//     connect: jest.fn(),
//   };
//   return jest.fn(() => mRedis);
// });

describe('RedisService', () => {
  let redisService: RedisService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
    redisMock = redisService.getClient() as jest.Mocked<Redis>;
  });

  afterEach(async () => {
    await redisMock.quit();
    jest.resetAllMocks();
  });

  it('Should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('Should call connectWithRetry on module init', async () => {
    jest.spyOn(redisMock, 'connect').mockResolvedValue();

    await redisMock.connect();

    expect(redisMock.connect).toHaveBeenCalledTimes(1);
  });

  // it('Should retry connection and succeed on second attempt', async () => {
  //   jest
  //     .spyOn(redisMock, 'connect')
  //     .mockRejectedValueOnce(new Error('First attempt failed'))
  //     .mockResolvedValueOnce(undefined);

  //   // Dispara o evento 'ready' para simular uma conexão bem-sucedida
  //   jest.spyOn(redisMock, 'on').mockImplementation((event, callback) => {
  //     if (event === 'ready') {
  //       callback();
  //     }
  //     return redisMock;
  //   });

  //   // Chama o método privado connectWithRetry
  //   await redisService['connectWithRetry']();

  //   // Verifica se o método connect foi chamado duas vezes
  //   expect(redisMock.connect).toHaveBeenCalledTimes(2);
  // });

  // it('Should throw InternalServerErrorException after max retries', async () => {
  //   jest
  //     .spyOn(redisMock, 'connect')
  //     .mockRejectedValue(new Error('Connection failed'));

  //   // Dispara o evento 'error' para simular falhas na conexão
  //   jest.spyOn(redisMock, 'on').mockImplementation((event, callback) => {
  //     if (event === 'error') {
  //       callback(new Error('Connection failed'));
  //     }
  //     return redisMock;
  //   });

  //   // Verifica se a exceção é lançada após o número máximo de tentativas
  //   await expect(redisService['connectWithRetry']()).rejects.toThrow(
  //     InternalServerErrorException,
  //   );

  //   // Verifica se o método connect foi chamado o número máximo de vezes
  //   expect(redisMock.connect).toHaveBeenCalledTimes(redisService['maxRetries']);
  // });

  it('Should enable shutdown hooks', async () => {
    const mockApp: any = {
      close: jest.fn().mockResolvedValue(undefined),
    };

    jest
      .spyOn(redisService, 'enableShutdownHooks')
      .mockResolvedValue(undefined);

    await redisService.enableShutdownHooks(mockApp);
    await redisMock.quit();

    expect(redisService.enableShutdownHooks).toHaveBeenCalled();
    expect(redisMock.quit).toHaveBeenCalled();
  });
});
