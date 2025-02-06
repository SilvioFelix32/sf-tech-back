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
  data: Category[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface ICachedData {
  timestamp: number;
  data: IPaginatedResult<Category>;
}
