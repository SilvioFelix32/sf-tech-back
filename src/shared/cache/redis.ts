import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'
import fs from 'fs'
@Injectable()
export class RedisService extends Redis {
    constructor() {
        super({
            host: process.env.REDIS_HOST,
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD,
            port: 6379,
            connectTimeout: 5000, // tempo limite de conexão (em milissegundos),
            tls: {
                ca: '/redis.crt',
                rejectUnauthorized: false,
            },
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