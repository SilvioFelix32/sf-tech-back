import { PaginatedResult } from 'prisma-pagination';
import { Category } from '../entities/category.entity';

export const categoryResponse = {
  category_id: true,
  company_id: true,
  description: true,
  products: true,
  title: true,
};

export interface ICategoryResponse {
  message: string;
  data: PaginatedResult<Category>;
}
