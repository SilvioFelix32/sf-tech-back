import { Module } from '@nestjs/common';
import { CompaniesService } from '../../companies/services/companies.service';
import { CategoryService } from '../services/category.service';
import { CategoryController } from '../infra/category.controller';
import { SharedServicesModule } from 'src/shared/infraestructure/shared-services.module';

@Module({
  controllers: [CategoryController],
  exports: [CategoryService],
  imports: [SharedServicesModule],
  providers: [CategoryService, CompaniesService],
})
export class CategoryModule {}
