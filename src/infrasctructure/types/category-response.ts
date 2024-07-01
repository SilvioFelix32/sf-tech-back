import { PaginatedResult } from 'prisma-pagination';
import { Category } from '../../domain/entities/categories/category.entity';
import { IPaginatedResult } from './paginate-data';

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

export interface ICachedData {
  timestamp: number;
  data: IPaginatedResult<Category>;
}
