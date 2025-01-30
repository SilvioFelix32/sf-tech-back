import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../../../shared/config/env';
import fs from 'fs';
import path from 'path';

const certPath = path.resolve(process.cwd(), 'redis-ca.crt');
const caCert = fs.readFileSync(certPath, 'utf8');

@Injectable()
export class RedisService extends Redis {
  constructor() {
    if (!fs.existsSync(certPath)) {
      console.error('Certified path not found:', certPath);
      process.exit(1);
    }

    if (!caCert) {
      console.error('Certified not found');
      process.exit(1);
    }

    const redisClient = {
      host: env.REDIS_HOST,
      username: env.REDIS_USER,
      password: env.REDIS_PASSWORD,
      port: env.REDIS_PORT,
      tls: {
        ca: caCert,
        rejectUnauthorized: false,
      },
      showFriendlyErrorStack: true,
    };

    console.info('RedisService.constructor(), redisClient:', redisClient);
    super(redisClient);

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
