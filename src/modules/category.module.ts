import { Module, forwardRef } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { CategoryService } from '../domain/services/categories/category.service';
import { CategoryController } from '../infrasctructure/http/controllers/categories/category.controller';
import { SharedServicesModule } from './shared-services.module';
import { ProductModule } from './product.module';
import { ErrorHandler } from '../shared/errors/error-handler';

@Module({
  imports: [
    SharedServicesModule,
    ErrorHandler,
    forwardRef(() => ProductModule),
  ],
  providers: [CategoryService, CompaniesService, ErrorHandler],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
