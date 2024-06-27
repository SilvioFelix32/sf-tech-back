import { Module } from '@nestjs/common';
import { PrismaService } from './prisma-service/prisma.service';
import { RedisService } from './cache-service/redis.service';

@Module({
  exports: [PrismaService, RedisService],
  providers: [PrismaService, RedisService],
})
export class SharedServicesModule {}
