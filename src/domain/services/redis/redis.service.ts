import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../../../shared/config/env';

@Injectable()
export class RedisService extends Redis {
  constructor() {
    super({
      host: env.REDIS_HOST,
      username: env.REDIS_USER,
      password: env.REDIS_PASSWORD,
      port: env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
      },
    });

    super.on('error', (err) => {
      console.info('Error on Redis Service');
      console.info(err);
      process.exit(1);
    });

    super.on('connect', () => {
      console.info('Redis Service connected!');
    });
  }
}
