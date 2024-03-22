import { IsArray, IsOptional, IsString } from 'class-validator';
import { QueryPaginateDto } from '../../../shared/paginator/query-paginate.dto';
import { Product } from '@prisma/client';

export class FindCategoryDto extends QueryPaginateDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  products: Product[];
}
