export class Category {
  category_id: string;
  company_id: string;
  title?: string;
  description?: string;
  products?: any;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
