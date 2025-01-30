import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../../../shared/config/env';

const redisBody = {
  host: env.REDIS_HOST,
  username: env.REDIS_USER,
  password: env.REDIS_PASSWORD,
  port: env.REDIS_PORT,
  tls: {
    ca: ['/usr/certificates/redis.crt'],
    rejectUnauthorized: false,
  },
};
@Injectable()
export class RedisService extends Redis {
  constructor() {
    super(redisBody);

    super.on('ready', () => {
      console.log('Redis Service, starting...', redisBody);
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
