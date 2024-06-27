import { Module, forwardRef } from '@nestjs/common';
import { CompaniesService } from '../../companies/services/companies.service';
import { CategoryService } from '../services/category.service';
import { CategoryController } from '../infra/category.controller';
import { SharedServicesModule } from 'src/shared/infraestructure/shared-services.module';
import { ProductModule } from 'src/application/product/modules/product.module';

@Module({
  imports: [SharedServicesModule, forwardRef(() => ProductModule)],
  controllers: [CategoryController],
  providers: [CategoryService, CompaniesService],
  exports: [CategoryService],
})
export class CategoryModule {}
