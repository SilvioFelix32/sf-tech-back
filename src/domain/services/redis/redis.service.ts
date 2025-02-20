import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { env } from '../../../shared/config/env';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private instance: Redis | null = null;
  private readonly maxRetries = 3;
  private retryCount = 0;

  constructor() {
    this.connectWithRetry();
  }

  getClient(): Redis {
    if (!this.instance || this.instance.status !== 'ready') {
      this.connectWithRetry();
    }
    return this.instance!;
  }

  private async connectWithRetry(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.retryCount >= this.maxRetries) {
        console.error(
          `RedisService: Exceeded max retry attempts (${this.retryCount})`,
        );
        reject(
          new InternalServerErrorException(
            'RedisService: Could not connect to Redis after multiple attempts.',
          ),
        );
        return;
      } else {
        console.warn(
          `RedisService: Attempting to connect to Redis (attempt ${this.retryCount + 1} of ${this.maxRetries})`,
        );
      }

      this.instance = new Redis({
        host: env.REDIS_HOST,
        username: env.REDIS_USER,
        password: env.REDIS_PASSWORD,
        port: env.REDIS_PORT,
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.instance.on('connect', () => {
        console.info('RedisService: Successfully connected to Redis');
        this.retryCount = 0;
        resolve();
      });

      this.instance.on('error', (err) => {
        console.error(`RedisService: Connection error: ${err.message}`);
        this.retryCount++;
        this.instance = null;
        setTimeout(() => this.connectWithRetry(), 1000);
      });
    });
  }
}
