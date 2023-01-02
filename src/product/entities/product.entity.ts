export class Product {
  product_id: string;
  category_id: string;
  company_id: string;
  sku: string;
  title: string;
  subtitle: string;
  description: string;
  url_banner?: string;
  value: number;
  discount: number;
  active: boolean;
  combo?: boolean;
  highlighted: boolean;
  for_sale: boolean;

  items: any;
  product_combo: any;
  item_sales: any;
  total_sales: any;

  created_at: Date | string;
  updated_at: Date | string;
}
