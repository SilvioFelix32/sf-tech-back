import { Product } from '@prisma/client';

export class Category {
  category_id: string;
  company_id: string;
  title?: string;
  description?: string;
  products?: Product[];

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
