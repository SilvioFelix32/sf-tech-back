import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../../../shared/config/env';

const port = env.REDIS_PORT;

@Injectable()
export class RedisService extends Redis {
  constructor() {
    super({
      host: env.REDIS_HOST,
      password: env.REDIS_PASSWORD,
      port,
      tls: {
        ca: ['/usr/certificates/redis.crt'],
        rejectUnauthorized: false,
      },
      username: env.REDIS_USER,
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
