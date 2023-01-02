import { ProductType } from 'src/product/entities/product-type.entity';
import { Product } from 'src/product/entities/product.entity';

export class ProductCategory {
  category_id?: string;
  company_id?: string;
  product_type?: ProductType;
  title?: string;
  description?: string | null;
  active?: boolean;
  products?: Product[] | null;

  created_at?: Date | string;
  updated_at?: Date | string;
}
