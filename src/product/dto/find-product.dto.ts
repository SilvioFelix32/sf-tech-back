import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { QueryPaginateDto } from '../../shared/paginator/query-paginate.dto';
import { ProductType } from '../entities/product-type.entity';

export class FindProductDto extends QueryPaginateDto {
  @IsString()
  @IsUUID()
  @IsOptional()
  product_id?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @IsString()
  @IsOptional()
  product_type?: ProductType;

  @IsString()
  @IsOptional()
  sku?: string | null;

  @IsString()
  @IsOptional()
  title?: string | null;

  @IsString()
  @IsOptional()
  subtitle?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  url_banner?: string | null;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean | null;

  @IsBoolean()
  @IsOptional()
  combo?: boolean | null;

  @IsBoolean()
  @IsOptional()
  highlighted?: boolean | null;

  @IsBoolean()
  @IsOptional()
  for_sale?: boolean | null;

  @IsOptional()
  items: any;

  @IsOptional()
  product_combo: any;

  @IsOptional()
  item_sales: any;

  @IsOptional()
  total_sales: any;

  @IsDate()
  @IsOptional()
  created_at?: Date | string;

  @IsDate()
  @IsOptional()
  updated_at?: Date | string;
}
