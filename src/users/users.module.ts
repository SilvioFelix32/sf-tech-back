import { Module } from '@nestjs/common';
import { UsersController } from './infra/users.controller';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UsersService } from './services/users.service';
import { CompaniesService } from '../companies/services/companies.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [CompaniesService, PrismaService, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
