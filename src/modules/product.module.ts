import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from '../infrastructure/http/controllers/products/product.controller';
import { ProductService } from '../domain/services/products/product.service';
import { SharedServicesModule } from './shared-services.module';
import { CategoryModule } from './category.module';

@Module({
  imports: [SharedServicesModule, forwardRef(() => CategoryModule)],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
