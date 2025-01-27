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
  highlighted?: boolean;
  active?: boolean;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
