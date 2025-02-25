import {
  INestApplication,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { environment } from '../../../shared/config/env';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private static instance: RedisService | null = null;
  private client!: Redis;
  private readonly maxRetries = 3;
  private connectionAttempts = 0;

  constructor() {
    if (RedisService.instance) {
      return RedisService.instance;
    }

    this.client = new Redis({
      host: environment.REDIS_HOST,
      username: environment.REDIS_USER,
      password: environment.REDIS_PASSWORD,
      port: environment.REDIS_PORT,
      tls: { rejectUnauthorized: false },
    });

    RedisService.instance = this;
  }

  getClient(): Redis {
    if (!this.client || this.client.status !== 'ready') {
      console.warn(
        'RedisService.getClient(): Redis client is not ready, reconnecting...',
      );
      this.connectWithRetry();
    }
    return this.client;
  }

  async onModuleInit() {
    try {
      console.info(
        'RedisService.onModuleInit(): Started creating connection with Redis',
      );
      await this.connectWithRetry();
    } catch (err) {
      console.error(
        `RedisService.onModuleInit(): Failed to connect with Redis: ${err}`,
      );
    }
  }

  private async connectWithRetry(): Promise<void> {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.client.once('ready', () => {
            console.info('RedisService.connectWithRetry(): Redis connected!');
            resolve();
          });

          this.client.once('error', (err) => {
            console.error(
              `RedisService.connectWithRetry(): Attempt ${this.connectionAttempts + 1} failed: ${err}`,
            );
            this.connectionAttempts++;
            reject(err);
          });
        });

        return;
      } catch {
        if (this.connectionAttempts >= this.maxRetries) {
          throw new InternalServerErrorException(
            `Maximum connection attempts to Redis (${this.maxRetries}) reached.`,
          );
        }
      }
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await this.client.quit();
      await app.close();
    });
  }
}
