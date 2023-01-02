import { Module } from '@nestjs/common';
import { CompaniesService } from 'src/companies/services/companies.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductController } from '../infra/product.controller';
import { ProductService } from '../services/product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, CompaniesService],
  exports: [ProductService],
})
export class ProductModule {}
