export class Product {
  declare product_id: string;
  declare category_id: string;
  sku?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  urlBanner?: string;
  price?: number;
  discount?: number;
  stock?: number;
  stock_level?: 'OutOfStock' | 'Low' | 'Medium' | 'High';
  highlighted?: boolean;
  active?: boolean;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
