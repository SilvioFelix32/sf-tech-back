import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../../../shared/config/env';
// import fs from 'fs';
// import path from 'path';

// const certPath = path.resolve(process.cwd(), 'redis-ca.crt');
// const caCert = fs.readFileSync(certPath, 'utf8');

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private instance: Redis;

  constructor() {
    this.instance = new Redis({
      host: env.REDIS_HOST,
      username: env.REDIS_USER,
      password: env.REDIS_PASSWORD,
      port: env.REDIS_PORT,
      tls: {
        // ca: [caCert],
        rejectUnauthorized: false,
      },
      retryStrategy: (times) => {
        if (times >= 3) {
          console.error(`RedisService: Exceeded max retry attempts (${times})`);
          throw new InternalServerErrorException(
            'RedisService: Could not connect to Redis after multiple attempts.',
          );
        }
        console.warn(`RedisService: Retrying connection (${times})...`);
        return Math.min(times * 100, 3000);
      },
    });

    this.instance.on('error', (err) => {
      console.error('RedisService: Connection error', err);
      throw new InternalServerErrorException(
        'RedisService: Could not connect to Redis.',
      );
    });

    this.instance.on('connect', () => {
      console.info('RedisService: Successfully connected to Redis');
    });
  }

  async onModuleInit() {
    console.info('RedisService.onModuleInit(): Ready');
  }

  async onModuleDestroy() {
    console.info('RedisService: Closing Redis connection');
    await this.instance.quit();
  }

  getClient(): Redis {
    return this.instance;
  }
}
