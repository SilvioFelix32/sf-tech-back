import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'
@Injectable()
export class RedisService extends Redis {
    constructor() {
        super({
            host: process.env.REDIS_PORT,
            username: process.env.REDIS_USER,
            port: 6379
        })

        super.on('error', (err) => {
            console.log('Error on Redis Service');
            console.log(err);
            process.exit(1);
        });

        super.on('connect', () => {
            console.log('Redis Service connected!');
        });
    }
}