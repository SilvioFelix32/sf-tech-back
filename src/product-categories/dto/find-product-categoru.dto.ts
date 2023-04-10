import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { QueryPaginateDto } from '../../shared/paginator/query-paginate.dto';
import { ProductType } from '../../product/entities/product-type.entity';

export class FindProductCategoryDto extends QueryPaginateDto {
  @IsString()
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @IsEnum(ProductType)
  @IsOptional()
  product_type: ProductType;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsOptional()
  @IsArray()
  products?: any;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  @IsDate()
  created_at?: Date | string;

  @IsString()
  @IsOptional()
  @IsDate()
  updated_at?: Date | string;
}
