import { Global, Module } from '@nestjs/common';
import { DatabaseService } from '../domain/services/database/database.service';
import { RedisService } from '../domain/services/redis/redis.service';
import { CacheService } from '../domain/services/cache/cache.service';
import { ErrorHandler } from 'src/shared/errors/error-handler';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  exports: [
    DatabaseService,
    RedisService,
    CacheService,
    ErrorHandler,
    JwtService,
  ],
  providers: [
    DatabaseService,
    RedisService,
    CacheService,
    ErrorHandler,
    JwtService,
  ],
})
export class SharedServicesModule { }
