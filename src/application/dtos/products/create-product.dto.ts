import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  sku: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  urlBanner?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  discount: number;

  @IsBoolean()
  @IsOptional()
  highlighted: boolean;

  @IsBoolean()
  @IsOptional()
  active: boolean;
}
