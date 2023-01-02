import { Module } from '@nestjs/common';
import { ProductCategoriesService } from '../services/product-categories.service';
import { ProductCategoriesController } from '../infra/product-categories.controller';
import { CompaniesService } from 'src/companies/services/companies.service';
import { ProductService } from 'src/product/services/product.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [ProductCategoriesController],
  providers: [
    ProductCategoriesService,
    PrismaService,
    CompaniesService,
    ProductService,
  ],
  exports: [ProductCategoriesService],
})
export class ProductCategoriesModule {}
