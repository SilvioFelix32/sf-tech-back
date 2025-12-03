import {
  INestApplication,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { environment } from '../../../shared/config/env';
import Redis from 'ioredis';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit {
  private static instance: RedisService | null = null;
  private client!: Redis;
  private readonly maxRetries = 3;
  private connectionAttempts = 0;

  constructor(private readonly logger: Logger) {
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
      this.logger.info(
        `RedisService.getClient() - Redis client is not ready, reconnecting...`,
        { metadata: { status: this.client?.status } },
      );
      this.connectWithRetry();
    }
    return this.client;
  }

  async onModuleInit() {
    try {
      this.logger.info(
        `RedisService.onModuleInit() - Started creating connection with Redis`,
      );
      await this.connectWithRetry();
    } catch (err) {
      this.logger.error(
        `RedisService.onModuleInit() - Failed to connect with Redis`,
        { error: err instanceof Error ? err : new Error(String(err)) },
      );
    }
  }

  private async connectWithRetry(): Promise<void> {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.client.once('ready', () => {
            this.logger.info(
              `RedisService.connectWithRetry() - Redis connected successfully`,
            );
            resolve();
          });

          this.client.once('error', (err) => {
            this.logger.error(
              `RedisService.connectWithRetry() - Connection attempt ${this.connectionAttempts + 1} failed`,
              {
                error: err instanceof Error ? err : new Error(String(err)),
                metadata: { attempt: this.connectionAttempts + 1, maxRetries: this.maxRetries },
              },
            );
            this.connectionAttempts++;
            reject(err);
          });
        });

        return;
      } catch {
        if (this.connectionAttempts >= this.maxRetries) {
          this.logger.error(
            `RedisService.connectWithRetry() - Maximum retries reached`,
            { metadata: { attempts: this.connectionAttempts, maxRetries: this.maxRetries } },
          );
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
