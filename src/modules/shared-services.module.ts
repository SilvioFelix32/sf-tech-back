import { Module } from '@nestjs/common';
import { PrismaService } from '../domain/services/prisma/prisma.service';
import { RedisService } from '../domain/services/redis/redis.service';
import { CacheService } from '../domain/services/cache/cache.service';
import { ErrorHandler } from 'src/shared/errors/error-handler';
import { JwtService } from '@nestjs/jwt';

@Module({
  exports: [
    PrismaService,
    RedisService,
    CacheService,
    ErrorHandler,
    JwtService,
  ],
  providers: [
    PrismaService,
    RedisService,
    CacheService,
    ErrorHandler,
    JwtService,
  ],
})
export class SharedServicesModule {}
