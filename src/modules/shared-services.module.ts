import { Module } from '@nestjs/common';
import { PrismaService } from '../infrasctructure/prisma/prisma.service';
import { RedisService } from '../infrasctructure/cache/redis.service';

@Module({
  exports: [PrismaService, RedisService],
  providers: [PrismaService, RedisService],
})
export class SharedServicesModule {}
