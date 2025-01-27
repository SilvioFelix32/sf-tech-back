export class Category {
  declare category_id: string;
  declare company_id: string;
  title?: string;
  description?: string;
  products?: any;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
