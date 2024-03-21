import { Module } from '@nestjs/common';
import { UsersController } from './infra/users.controller';
import { PrismaService } from '../infraestructure/prisma/prisma.service';
import { UsersService } from './services/users.service';
import { CompaniesService } from '../companies/services/companies.service';
import { RedisService } from '../infraestructure/cache/redis';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [],
  providers: [CompaniesService, PrismaService, UsersService, RedisService],
})
export class UsersModule {}
