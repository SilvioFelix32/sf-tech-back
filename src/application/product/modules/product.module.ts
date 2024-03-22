import { Module } from '@nestjs/common';
import { CompaniesService } from '../../companies/services/companies.service';
import { ProductController } from '../infra/product.controller';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../../productCategory/services/category.service';
import { SharedServicesModule } from 'src/shared/infraestructure/shared-services.module';

@Module({
  controllers: [ProductController],
  exports: [ProductService],
  imports: [SharedServicesModule],
  providers: [ProductService, CompaniesService, CategoryService],
})
export class ProductModule {}
