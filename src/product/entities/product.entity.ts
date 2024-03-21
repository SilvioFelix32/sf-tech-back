export class Product {
  product_id: string;
  company_id: string;
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
