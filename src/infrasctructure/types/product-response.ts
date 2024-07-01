import { PaginatedResult } from 'prisma-pagination';
import { Product } from '../../domain/entities/products/product.entity';
import { IPaginatedResult } from './paginate-data';

export const productResponse = {
  active: true,
  category_id: true,
  description: true,
  discount: true,
  highlighted: true,
  price: true,
  product_id: true,
  sku: true,
  subtitle: true,
  title: true,
  urlBanner: true,
};

export interface IProductResponse {
  message: string;
  data: PaginatedResult<Product>;
}

export interface ICachedData {
  timestamp: number;
  data: IPaginatedResult<Product>;
}
