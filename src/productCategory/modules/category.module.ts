import { Module } from '@nestjs/common';
import { CompaniesService } from '../../companies/services/companies.service';
import { PrismaService } from '../../infraestructure/prisma/prisma.service';
import { RedisService } from '../../infraestructure/cache/redis';
import { CategoryService } from '../services/category.service';
import { CategoryController } from '../infra/category.controller';

@Module({
  controllers: [CategoryController],
  exports: [CategoryService],
  imports: [],
  providers: [CategoryService, PrismaService, RedisService, CompaniesService],
})
export class CategoryModule {}
