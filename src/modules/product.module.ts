import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from '../infrasctructure/http/controllers/products/product.controller';
import { ProductService } from '../domain/services/products/product.service';
import { SharedServicesModule } from './shared-services.module';
import { CategoryModule } from './category.module';
import { ErrorHandler } from '../shared/errors/error-handler';

@Module({
  imports: [
    SharedServicesModule,
    ErrorHandler,
    forwardRef(() => CategoryModule),
  ],
  controllers: [ProductController],
  providers: [ProductService, ErrorHandler],
  exports: [ProductService],
})
export class ProductModule {}
