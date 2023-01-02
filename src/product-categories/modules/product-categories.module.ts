import { Module } from '@nestjs/common';
import { ProductCategoriesService } from '../services/product-categories.service';
import { ProductCategoriesController } from '../infra/product-categories.controller';
import { CompaniesService } from '../../companies/services/companies.service';
import { ProductService } from '../../product/services/product.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

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
