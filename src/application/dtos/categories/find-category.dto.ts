import { IsArray, IsOptional, IsString } from 'class-validator';
import { QueryPaginateDto } from '../../../shared/paginator/query-paginate.dto';

export class FindCategoryDto extends QueryPaginateDto {
  @IsString()
  @IsOptional()
  declare title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  products?: any;
}
