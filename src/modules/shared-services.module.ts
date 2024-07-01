import { Module } from '@nestjs/common';
import { PrismaService } from '../domain/services/prisma/prisma.service';
import { RedisService } from '../domain/services/redis/redis.service';
import { CacheService } from '../domain/services/cache/cache.service';

@Module({
  exports: [PrismaService, RedisService, CacheService],
  providers: [PrismaService, RedisService, CacheService],
})
export class SharedServicesModule {}
