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
  declare sku: string;

  @IsString()
  @IsNotEmpty()
  declare title: string;

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
  declare price: number;

  @IsNumber()
  @IsOptional()
  declare discount: number;

  @IsBoolean()
  @IsOptional()
  declare highlighted: boolean;

  @IsBoolean()
  @IsOptional()
  declare active: boolean;
}
