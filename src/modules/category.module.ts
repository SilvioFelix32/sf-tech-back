import { Module, forwardRef } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { CategoryService } from '../domain/services/categories/category.service';
import { CategoryController } from '../infrasctructure/http/controllers/categories/category.controller';
import { SharedServicesModule } from './shared-services.module';
import { ProductModule } from './product.module';

@Module({
  imports: [SharedServicesModule, forwardRef(() => ProductModule)],
  providers: [CategoryService, CompaniesService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
