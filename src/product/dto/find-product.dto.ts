import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryPaginateDto } from '../../shared/paginator/query-paginate.dto';

export class FindProductDto extends QueryPaginateDto {
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
  urlBanner?: string | null;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsBoolean()
  @IsOptional()
  highlighted?: boolean | null;
}
