import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from '../infrasctructure/http/controllers/products/product.controller';
import { ProductService } from '../domain/services/products/product.service';
import { SharedServicesModule } from './shared-services.module';
import { CategoryModule } from './category.module';
import { ErrorHandler } from '../shared/errors/error-handler';
import { CategoryService } from 'src/domain/services/categories/category.service';

@Module({
  imports: [SharedServicesModule, forwardRef(() => CategoryModule)],
  providers: [ProductService, CategoryService, ErrorHandler],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
