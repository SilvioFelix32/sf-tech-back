import { Module } from '@nestjs/common';
import { CompaniesService } from '../../companies/services/companies.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ProductController } from '../infra/product.controller';
import { ProductService } from '../services/product.service';
import { RedisService } from '../../shared/cache/redis';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, RedisService, CompaniesService],
  exports: [ProductService],
})
export class ProductModule {}
