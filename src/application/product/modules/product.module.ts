import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from '../infra/product.controller';
import { ProductService } from '../services/product.service';
import { SharedServicesModule } from 'src/shared/infraestructure/shared-services.module';
import { CategoryModule } from 'src/application/productCategory/modules/category.module';

@Module({
  imports: [SharedServicesModule, forwardRef(() => CategoryModule)],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
