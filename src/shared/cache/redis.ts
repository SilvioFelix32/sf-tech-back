import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'
import fs from 'fs'
@Injectable()
export class RedisService extends Redis {
    constructor() {
        super()

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