import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ProductTotalSales } from '../entities/product-total-sales.entity';

export class ProductTotalSalesDto extends ProductTotalSales {
  @IsUUID()
  @IsString()
  @IsOptional()
  product_id?: string;

  @IsUUID()
  @IsString()
  @IsOptional()
  sale_total_id: string;

  @IsDate()
  date: Date;

  @IsNumber()
  amount: number;

  @IsDate()
  @IsString()
  @IsOptional()
  created_at?: Date;

  @IsDate()
  @IsString()
  @IsOptional()
  updated_at?: Date;
}
