import { Module } from '@nestjs/common';
import { CompaniesService } from '../../companies/services/companies.service';
import { PrismaService } from '../../infraestructure/prisma/prisma.service';
import { ProductController } from '../infra/product.controller';
import { ProductService } from '../services/product.service';
import { RedisService } from '../../infraestructure/cache/redis';

@Module({
  controllers: [ProductController],
  exports: [ProductService],
  imports: [],
  providers: [ProductService, PrismaService, RedisService, CompaniesService],
})
export class ProductModule {}
