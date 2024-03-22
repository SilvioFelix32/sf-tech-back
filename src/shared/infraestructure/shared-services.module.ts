import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './cache/redis';

@Module({
  exports: [PrismaService, RedisService],
  providers: [PrismaService, RedisService],
})
export class SharedServicesModule {}
