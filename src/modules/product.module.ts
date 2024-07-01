import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from '../infrasctructure/http/controllers/products/product.controller';
import { ProductService } from '../domain/services/products/product.service';
import { SharedServicesModule } from './shared-services.module';
import { CategoryModule } from './category.module';

@Module({
  imports: [SharedServicesModule, forwardRef(() => CategoryModule)],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
